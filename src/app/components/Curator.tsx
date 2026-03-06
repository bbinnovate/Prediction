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
} from "firebase/firestore";
import { query, where, limit } from "firebase/firestore";
import { updateLeaderboard } from "@/lib/updateLeaderboard";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Button from "./Button";

export default function Curator() {
  const [questions, setQuestions] = useState(["", "", "", "", ""]);
  const [savedQuestions, setSavedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<any>({});
  const [answered, setAnswered] = useState(false);
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  // LOAD PAGE + PERMISSION CHECK
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // check if this user is today's curator
const userSnap = await getDoc(doc(db, "users", user.uid));

if (!userSnap.exists()) {
  router.push("/");
  return;
}

const role = userSnap.data().role;

if (role !== "admin") {
  const curatorSnap = await getDoc(doc(db, "dailyCurator", today));

  if (!curatorSnap.exists() || curatorSnap.data().curatorId !== user.uid) {
    router.push("/");
    return;
  }
}

      // check if questions already exist today
const q = query(
  collection(db, "questions"),
  where("date", "==", today),
  where("curatorId", "==", user.uid),
  limit(5)
);

const snap = await getDocs(q);

      const data = snap.docs
  .map((d) => ({
    id: d.id,
    ...d.data(),
  }))

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
  }, []);

  // UPDATE INPUT
  const updateQuestion = (index: number, value: string) => {
    const arr = [...questions];
    arr[index] = value;
    setQuestions(arr);
  };

  // SAVE QUESTIONS (ONLY ONCE PER DAY)
  const saveQuestions = async () => {
   if (savedQuestions.length >= 5) {
  alert("5 questions already exist for today");
  return;
}

    const created: any[] = [];

    for (const q of questions) {
      if (!q) continue;

      const ref = await addDoc(collection(db, "questions"), {
        question: q,
        correctAnswer: null,
        date: today,
        curatorId: auth.currentUser?.uid,
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
    const updated: any[] = [];

    for (const q of savedQuestions) {
      const ans = answers[q.id];

      if (!ans) {
        alert("Answer all questions");
        return;
      }

      await updateDoc(doc(db, "questions", q.id), {
  correctAnswer: ans,
  answeredBy: auth.currentUser?.uid
});

      updated.push({ ...q, correctAnswer: ans });
    }

    setSavedQuestions(updated);

    const answerObj: any = {};

    updated.forEach((q) => {
      answerObj[q.id] = q.correctAnswer;
    });

await updateLeaderboard(answerObj);

alert("Answers saved");

setAnswered(true);
  };

  if (loading) return  <section className="h-screen flex items-center justify-center">
        <p>Loading questions...</p>
      </section>;

  if (answered) {
    return (
      <div className="container h-screen lg:pt-40 pt-0 lg:py-20 md:py-15 py-10">
        <h1 className="text-2xl font-bold">
          You have answered today's questions. Thank you.
        </h1>
      </div>
    );
  }

  return (
    <div className=" container min-h-[calc(100vh-160px)] lg:pt-40 pt-30 lg:py-20 md:py-15 py-10 ">
      <h1 className="text-2xl font-bold mb-6">Add 5 Questions</h1>

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
        <div className="absolute right-0 top-0 h-full w-3 sm:w-5 md:w-5 candy-border"></div>
      
      {/* QUESTION BOX */}

      {savedQuestions.length > 0 && (
        <div className="">
          {savedQuestions.map((q) => (
            <div key={q.id} className="mb-4 gap-6">
              <p className="mb-2 font-medium white-text">{q.question}</p>

             <div className="flex gap-4">
  <button
    onClick={() => setAnswer(q.id, "yes")}
    className={`px-8 py-3 rounded-lg border border-[#fab31e] transition ${
      answers[q.id] === "yes"
        ? "bg-[#fab31e] text-black"
        : "text-white hover:bg-[#fab31e] hover:text-black"
    }`}
  >
    Yes
  </button>

  <button
    onClick={() => setAnswer(q.id, "no")}
    className={`px-8 py-3 rounded-lg border border-[#fab31e] transition ${
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
              text="Save Answers"
              onClick={saveAnswers}
              className="white-text mt-6"
            />
        </div>
      )}
    </div>
    </div>
  );
}
