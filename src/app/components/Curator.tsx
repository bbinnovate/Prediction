"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  query, 
  where,
  limit ,
  writeBatch,
} from "firebase/firestore";

import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { setDoc } from "firebase/firestore";
import { increment } from "firebase/firestore";
export default function Curator() {
  const [questions, setQuestions] = useState(["", "", "", ""]);
  const [savedQuestions, setSavedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<any>({});
  const [answered, setAnswered] = useState(false);
  const router = useRouter();
  const [assignedDate, setAssignedDate] = useState("");
  const [sessionUid, setSessionUid] = useState("");
  const [savingAnswers, setSavingAnswers] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const answerStart = 10 * 60 + 30; // 10:30 AM
  const answerEnd = 18 * 60; // 6:00 PM

  const canAnswer = minutesNow >= answerStart && minutesNow <= answerEnd;
  // LOAD PAGE + PERMISSION CHECK
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      let uid = user?.uid;

      if (!uid) {
        const pinUser = localStorage.getItem("pinUser");
        if (pinUser) {
          uid = JSON.parse(pinUser).uid;
        }

        if (!uid) {
          router.push("/login");
          return;
        }
      }

      setSessionUid(uid);

      // check if this user is today's curator
      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) {
        router.push("/");
        return;
      }

      const role = userSnap.data().role;

      let allowedDate = null;

      const curatorsSnap = await getDocs(collection(db, "dailyCurator"));

      const sixPM = 18 * 60;

      let activeDate: string | null = null;

      // before 6 PM → today's curator
      if (currentMinutes < sixPM) {
        activeDate = today;
      }

      // after 6 PM → tomorrow's curator
      if (currentMinutes >= sixPM) {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        const ty = t.getFullYear();
        const tm = String(t.getMonth() + 1).padStart(2, "0");
        const td = String(t.getDate()).padStart(2, "0");
        activeDate = `${ty}-${tm}-${td}`;
      }

      // admin always allowed
      if (role === "admin") {
        allowedDate = activeDate || today;
      } else {
        if (!activeDate) {
          allowedDate = null;
        } else {
          const curatorSnap = await getDoc(doc(db, "dailyCurator", activeDate));

          if (curatorSnap.exists()) {
            const data = curatorSnap.data();

            if (data.curatorId === uid) {
              allowedDate = activeDate;
            }
          }
        }
      }

      if (!allowedDate && role !== "admin") {
        router.push("/");
        return;
      }

      const finalDate = allowedDate || today;
      setAssignedDate(finalDate);

      // check if questions already exist
      const q = query(
        collection(db, "questions"),
        where("date", "==", finalDate),
        limit(10),
      );

      const snap = await getDocs(q);

      const raw = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      // remove duplicate questions
      const seen = new Set<string>();
      const unique: any[] = [];

      for (const q of raw) {
        const text = q.question?.trim().toLowerCase();

        if (!seen.has(text)) {
          seen.add(text);
          unique.push(q);
        }
      }

      // always show only first 4
      const data = unique.slice(0, 4);

      if (data.length > 0) {
        const allAnswered = data.every((q: any) => q.correctAnswer !== null);

        if (allAnswered) {
          setAnswered(true);
        }

        setSavedQuestions(data);
      }

      setLoading(false);
    });

    return () => unsub();
  }, [assignedDate]);

  // UPDATE INPUT
  const updateQuestion = (index: number, value: string) => {
    const arr = [...questions];
    arr[index] = value;
    setQuestions(arr);
  };

  // SAVE QUESTIONS (ONLY ONCE PER DAY)
  const saveQuestions = async () => {
    if (savedQuestions.length >= 4) {
      alert("4 questions already exist for today");
      return;
    }

    const created: any[] = [];

    for (const q of questions) {
      if (!q) continue;

      const ref = await addDoc(collection(db, "questions"), {
        question: q,
        correctAnswer: null,
        date: assignedDate,
        curatorId: sessionUid,
        createdAt: serverTimestamp(),
      });

      created.push({
        id: ref.id,
        question: q,
        correctAnswer: null,
      });
    }

    setSavedQuestions(created);
  };

  // SELECT ANSWER
  const setAnswer = (id: string, answer: string) => {
    setAnswers((prev: any) => ({
      ...prev,
      [id]: answer,
    }));
  };

  // SAVE ANSWERS BUTTON


const saveAnswers = async () => {
  if (savingAnswers) return;

  const allAnswered = savedQuestions.every(q => answers[q.id]);

  if (!allAnswered) {
    alert("Answer all questions first");
    return;
  }

  try {
    setSavingAnswers(true);

    const batch = writeBatch(db);

    // ✅ SAVE ANSWERS
    for (const q of savedQuestions) {
      const ref = doc(db, "questions", q.id);

      batch.update(ref, {
        correctAnswer: answers[q.id],
        answeredBy: sessionUid
      });
    }

    await batch.commit();
    console.log("✅ Answers saved");

  } catch (err: any) {
    console.error("❌ Batch failed:", err);
    alert(err.message || "Failed to save answers");
    setSavingAnswers(false);
    return; // STOP here
  }

  // ⚠️ SEPARATE BLOCK
  try {
    await fetch("/api/calculate-score", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ date: assignedDate }),
});
    console.log("✅ Scores calculated");
  } catch (err: any) {
    console.error("❌ Score calculation failed:", err);
    alert("Answers saved but scoring failed");
    // still continue → answers ARE saved
  }

  setAnswered(true);
  setSavingAnswers(false);
};



  if (loading)
    return (
      <section className="h-screen flex items-center justify-center">
        <p>Loading questions...</p>
      </section>
    );

  if (answered) {
    return (
      <section className="container h-screen flex items-center justify-center">
        <div className="container bg-[#1D1D1D] rounded-[20px] px-10 py-24 text-center relative overflow-hidden max-w-full w-full">
          <h2 className="max-w-4xl mx-auto text-white mb-6">
            You have answered today's questions. Thank you.
          </h2>

          <Button
            className="white-text"
            text="View Leaderboard"
            onClick={() => (window.location.href = "/leaderboard")}
          />

          <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-6 h-full bg-[#FAB31E]"></div>
        </div>
      </section>
    );
  }

  if (!canAnswer && savedQuestions.length > 0) {
    return (
      <section className="container h-screen flex items-center justify-center">
        <div className="container bg-[#1D1D1D] rounded-[20px] px-10 py-24 text-center relative overflow-hidden max-w-full w-full">
          {/* Title */}
          <h2 className="max-w-4xl mx-auto text-white mb-3 text-2xl font-semibold">
            Questions Saved
          </h2>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-gray-300 mb-6">
            You can submit the correct answers after{" "}
            <span className="text-[#FAB31E] font-semibold">10:30 AM</span> once
            voting ends. Until then, you can still predict the outcomes.
          </p>

          <Button text="Predict" href="/" className=" white-text" />

          <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-6 h-full bg-[#FAB31E]"></div>
        </div>
      </section>
    );
  }
  return (
    <div className=" container min-h-[calc(100vh-160px)] lg:pt-40 pt-30 lg:py-20 md:py-15 py-10 ">
      <h1 className="text-2xl font-bold mb-6">Add 4 Questions</h1>

      {/* INPUTS */}
      <div className="bg-[#1D1D1D] rounded-[20px] relative overflow-hidden px-8 py-8 ">
        {savedQuestions.length === 0 && (
          <>
            {questions.map((q, i) => (
              <input
                key={i}
                className="w-full px-2 py-2 bg-transparent border-b border-[var(--color-highlight)] outline-none text-white"
                placeholder={`Question ${i + 1}`}
                value={q}
                onChange={(e) => updateQuestion(i, e.target.value)}
              />
            ))}

            <Button
              text="Save Questions"
              onClick={saveQuestions}
              className="white-text mt-6"
            />
          </>
        )}

        {/* Right yellow stripe preserved */}
        <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-6 h-full bg-[#FAB31E]"></div>

        {/* QUESTION BOX */}

        {savedQuestions.length > 0 && (
          <div className="">
            {savedQuestions.map((q) => (
              <div key={q.id} className="mb-4 gap-6">
                <p className="mb-2 font-medium white-text">{q.question}</p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setAnswer(q.id, "yes")}
                    className={`cursor-pointer px-8 py-3 rounded-lg border border-[#fab31e] transition ${
                      answers[q.id] === "yes"
                        ? "bg-[#fab31e] text-black"
                        : "text-white hover:bg-[#fab31e] hover:text-black"
                    }`}
                  >
                    Yes
                  </button>

                  <button
                    onClick={() => setAnswer(q.id, "no")}
                    className={`cursor-pointer px-8 py-3 rounded-lg border border-[#fab31e] transition ${
                      answers[q.id] === "no"
                        ? "bg-[#fab31e] text-black"
                        : "text-white hover:bg-[#fab31e] hover:text-black"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}

           <Button
  text={savingAnswers ? "Saving..." : "Save Answers"}
  onClick={saveAnswers}
  className="white-text mt-6"
  disabled={savingAnswers}
/>



          </div>
        )}
      </div>
    </div>
  );
}
