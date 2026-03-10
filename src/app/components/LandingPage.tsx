"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
  where,
  doc,
  getDoc ,
} from "firebase/firestore";
import { updateLeaderboard } from "@/lib/updateLeaderboard";
import { db, auth } from "@/lib/firebase";
import Button from "./Button";

const shootBottomSideConfetti = async () => {
  const confetti = (await import("canvas-confetti")).default;

  const duration = 2500;
  const end = Date.now() + duration;

  const colors = ["#f6a81c", "#ff4d6d", "#ffffff"];

  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 1 },
      colors,
      startVelocity: 45,
      gravity: 0.9,
    });

    confetti({
      particleCount: 6,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 1 },
      colors,
      startVelocity: 45,
      gravity: 0.9,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

export default function LandingPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [finished, setFinished] = useState(false);
  const totalSteps = questions?.length || 0;
  const progressPercentage = Math.round((step / (totalSteps - 1)) * 100);
  const [role, setRole] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [pin, setPin] = useState("");
  const [pendingSubmit, setPendingSubmit] = useState(false);

  useEffect(() => {
    if (checkingRole) return;
    if (role === "admin") return;

    const loadQuestions = async () => {
      const q = query(
        collection(db, "questions"),
        orderBy("createdAt", "desc"),
        limit(5),
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setQuestions(data);
    };

    loadQuestions();
  }, [checkingRole, role]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const userRole = snap.data().role?.toString().trim().toLowerCase();
        setRole(userRole);
      }

      setCheckingRole(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!finished) return;

    shootBottomSideConfetti();

    const audio = new Audio("/confetti.mp3");
    audio.volume = 0.8;
    audio.play();

    const stopTimer = setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 10000);

    return () => clearTimeout(stopTimer);
  }, [finished]);

const submitVotes = async (uid: any) => {

  try {

    for (const qid of Object.keys(answers)) {
      await addDoc(collection(db, "votes"), {
        userId: uid,
        questionId: qid,
        answer: answers[qid],
        createdAt: new Date(),
      });
    }

    const correctAnswers: any = {};

    questions.forEach((q) => {
      if (q.correctAnswer !== null && q.correctAnswer !== undefined) {
        correctAnswers[q.id] = q.correctAnswer;
      }
    });

    if (Object.keys(correctAnswers).length === questions.length) {
      await updateLeaderboard(correctAnswers, uid);
    }

    setFinished(true);

  } catch (err) {
    console.error("Vote error:", err);
    alert("Failed to submit votes");
  }
};

  const saveVotes = async () => {
    const user = auth.currentUser;

    if (!user) {
      setShowPinPopup(true);
      setPendingSubmit(true);
      return;
    }

    await submitVotes(user.uid);
  };

const verifyPin = async () => {

  if (pin.length !== 4) {
    alert("Enter 4 digit PIN");
    return;
  }

  const snap = await getDoc(doc(db, "pinLogin", pin));

  if (!snap.exists()) {
    alert("Incorrect PIN");
    return;
  }

  const uid = snap.data().uid;

  // close popup
  setShowPinPopup(false);

  // reset pin input
  setPin("");

  if (pendingSubmit) {
    setPendingSubmit(false);

    // run submit
    await submitVotes(uid);

    // force UI update
    setFinished(true);
  }
};

  const selectAnswer = (qid: any, value: any) => {
    setAnswers((prev: any) => ({
      ...prev,
      [qid]: value,
    }));

    // move automatically to next question
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const nextQuestion = () => {
    if (!answers[current.id]) {
      alert("Please select Yes or No");
      return;
    }

    setStep(step + 1);
  };

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (checkingRole) {
    return (
      <section className="h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </section>
    );
  }

  if (role === "admin") {
    return (
      <section className="container h-screen w-full flex justify-center items-center py-0 sm:py-15 lg:py-20">
        <div className="container bg-[#1D1D1D] rounded-[20px] px-10 py-24 text-center relative overflow-hidden max-w-full w-full">
          <h2 className="text-3xl text-white mb-6">You are an Admin</h2>

          <p className="text-gray-300 mb-8">
            You are not allowed to vote.
            <br />
            Please assign a curator.
          </p>

          <Button
            className=" white-text"
            text="Go to Admin Panel"
            onClick={() => (window.location.href = "/admin")}
          />
          <div className="absolute right-0 top-0 h-full w-3 sm:w-5 md:w-5 candy-border"></div>
        </div>
      </section>
    );
  }

  if (finished) {
    return (
      <section className="container h-screen w-full flex justify-center items-center py-0 sm:py-15 lg:py-20">
        <div className="container bg-[#1D1D1D] rounded-[20px] px-10 py-24 text-center relative overflow-hidden max-w-full w-full">
          <h2 className="text-4xl text-highlight mb-4">Thank You 🎉</h2>

          <p className="text-gray-300 text-lg">
            Your votes are saved successfully.
            <br />
            Results will appear on the leaderboard soon.
          </p>

          <div className="absolute right-0 top-0 h-full w-3 sm:w-5 md:w-5 candy-border"></div>
        </div>
      </section>
    );
  }

  const current = questions[step];

  if (!current) {
    return (
      <section className="h-screen flex items-center justify-center">
        <p className="text-white">Loading questions...</p>
      </section>
    );
  }

  return (
    <section
      id="second-section"
      className="container py-20 sm:py-15 lg:py-20 lg:pt-40 pt-50"
    >
      <div className="bg-[#1D1D1D] rounded-[20px] relative overflow-hidden px-6 py-8">
        <div className="max-w-3xl mx-auto text-center mb-6">
          <h2 className="text-3xl font-medium text-white">
            Office <span className="text-highlight">Predictions</span>
          </h2>

          <div className="mt-6">
            <div className="flex gap-3 items-center">
              {Array.from({ length: totalSteps }).map((_, idx) => {
                const filled = idx <= step;

                return (
                  <div
                    key={idx}
                    className={`flex-1 h-2 rounded-full ${
                      filled ? "bg-[#fab31e]" : "border border-gray-600"
                    }`}
                  />
                );
              })}
            </div>

            <div className="mt-3 text-sm text-gray-300 flex justify-between">
              <div>
                Step {step + 1} of {totalSteps}
              </div>

              <div className="text-highlight">{progressPercentage}%</div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="py-10">
            {step > 0 && (
              <button
                onClick={goBack}
                className="text-gray-300 underline mb-6 cursor-pointer"
              >
                ← Previous Question
              </button>
            )}

            <h3 className="text-xl text-white mb-10">{current.question}</h3>

            <div className="flex gap-6">
              <button
                onClick={() => selectAnswer(current.id, "yes")}
                className={`px-8 py-3 rounded-lg border border-[#fab31e] transition ${
                  answers[current.id] === "yes"
                    ? "bg-[#fab31e] text-black"
                    : "text-white hover:bg-[#fab31e] hover:text-black"
                }`}
              >
                Yes
              </button>

              <button
                onClick={() => selectAnswer(current.id, "no")}
                className={`px-8 py-3 rounded-lg border border-[#fab31e] transition ${
                  answers[current.id] === "no"
                    ? "bg-[#fab31e] text-black"
                    : "text-white hover:bg-[#fab31e] hover:text-black"
                }`}
              >
                No
              </button>

              {showPinPopup && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-xl w-[300px]">
                    <h3 className="text-lg font-semibold mb-4">
                      Enter Your 4 Digit PIN
                    </h3>

                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full border p-2 rounded mb-4"
                      placeholder="••••"
                    />

                    <button
                      onClick={verifyPin}
                      className="w-full bg-black text-white py-2 rounded"
                    >
                      Verify
                    </button>

                   <button
  onClick={() => {
    setShowPinPopup(false);
    setPin("");
    setPendingSubmit(false);
  }}
  className="mt-2 w-full border py-2 rounded"
>
  Cancel
</button>
                  </div>
                </div>
              )}

              {step === totalSteps - 1 && (
                <div className="ml-auto">
                  <Button
                    onClick={saveVotes}
                    text="Submit"
                    className="text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-0 h-full w-3 sm:w-5 md:w-5 candy-border"></div>
      </div>
    </section>
  );
}
