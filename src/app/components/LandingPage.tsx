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
  const [alreadyVotedError, setAlreadyVotedError] = useState(false);
  const [todayCurator, setTodayCurator] = useState<any>(null);
  const [checkingVote, setCheckingVote] = useState(true);
  const [timeExpired, setTimeExpired] = useState(false);

useEffect(() => {
  if (checkingRole || checkingVote || finished) return;
  if (role === "admin") return;

  const loadQuestions = async () => {
    const q = query(
      collection(db, "questions"),
      orderBy("createdAt", "desc"),
      limit(4)
    );

    const snap = await getDocs(q);

    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setQuestions(data);
  };

  loadQuestions();
}, [checkingRole, checkingVote, role, finished]);

useEffect(() => {
  const unsub = auth.onAuthStateChanged(async (user) => {

    if (!user) {
      setCheckingRole(false);
      setCheckingVote(false);
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));

    if (snap.exists()) {
      const userRole = snap.data().role?.toString().trim().toLowerCase();
      setRole(userRole);
    }

    const voted = await hasVotedToday(user.uid);

    if (voted) {
      setFinished(true);
    }

    setCheckingRole(false);
    setCheckingVote(false);

  });

  return () => unsub();
}, []);
useEffect(() => {

  const pinUser = localStorage.getItem("pinUser");

  if (pinUser) {
    const parsed = JSON.parse(pinUser);

    if (parsed?.uid) {
      setRole(parsed.role || "user");
      setCheckingRole(false);
    }
  }

}, []);

useEffect(() => {
  if (!finished) return;

  shootBottomSideConfetti();

  const audio = new Audio("/confetti.mp3");
  audio.volume = 0.8;

  audio.play().catch(() => {});

  const stopTimer = setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 10000);

  return () => clearTimeout(stopTimer);
}, [finished]);
useEffect(() => {
  const loadCurator = async () => {

    const today = new Date().toISOString().split("T")[0]; 
    // format: 2026-03-11 (same as admin saved)

    const snap = await getDoc(doc(db, "dailyCurator", today));

    if (snap.exists()) {
      setTodayCurator({
        name: snap.data().name,
        date: today,
      });
    }
  };

  loadCurator();
}, []);

useEffect(() => {

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // before 6 AM → not started
  if (hour < 6) {
    setTimeExpired(true);
    return;
  }

  // after 10:30 AM → expired
  if (hour > 10 || (hour === 10 && minute > 30)) {
    setTimeExpired(true);
  }

}, []);

  const hasVotedToday = async (uid: unknown) => {
  const start = new Date();
  start.setHours(0,0,0,0);

  const end = new Date();
  end.setHours(23,59,59,999);

  const q = query(
    collection(db, "votes"),
    where("userId", "==", uid),
    where("createdAt", ">=", start),
    where("createdAt", "<=", end),
    limit(1)
  );

  const snap = await getDocs(q);

  return !snap.empty;
};

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

    // logout user
    localStorage.removeItem("pinUser");
    await auth.signOut().catch(() => {});
    window.dispatchEvent(new Event("pin-logout"));

    setFinished(true);

  } catch (err) {
    console.error("Vote error:", err);
    alert("Failed to submit votes");
  }
};

const saveVotes = async () => {

  let uid: any = null;

  const user = auth.currentUser;
  if (user) uid = user.uid;

  const pinUser = localStorage.getItem("pinUser");
  if (!uid && pinUser) {
    uid = JSON.parse(pinUser).uid;
  }

  if (!uid) {
    setShowPinPopup(true);
    setPendingSubmit(true);
    return;
  }

const alreadyVoted = await hasVotedToday(uid);

if (alreadyVoted) {

  const pinUser = localStorage.getItem("pinUser");

  // PIN login → show error page
  if (pinUser) {
    setAlreadyVotedError(true);
  } 
  // Email login → show thank you page
  else {
    setFinished(true);
  }

  return;
}

  await submitVotes(uid);
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

  // get user info
  const userSnap = await getDoc(doc(db, "users", uid));

  if (userSnap.exists()) {

    const userData = userSnap.data();

    // 🔥 SAVE SESSION
    localStorage.setItem(
  "pinUser",
  JSON.stringify({
    uid,
    role: userData.role || "user",
    name: userData.name
  })
);

window.dispatchEvent(new Event("pin-login"));
  }

  setShowPinPopup(false);
  setPin("");

if (pendingSubmit) {

  const alreadyVoted = await hasVotedToday(uid);

if (alreadyVoted) {
  setAlreadyVotedError(true);
  setPendingSubmit(false);
  return;
}

  setPendingSubmit(false);
  await submitVotes(uid);
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
        <p className="black-text">Loading...</p>
      </section>
    );
  }

  if (timeExpired && !finished) {
  return (

<section className="container h-screen w-full flex justify-center items-center py-0 sm:py-15 lg:py-20">
  <div className="container bg-[#1D1D1D] rounded-[20px] px-10 py-24 text-center relative overflow-hidden max-w-full w-full">

    <h2 className="text-4xl text-red-400 mb-4">
      Oops! You missed it ⏰
    </h2>

    <p className="text-gray-300 text-lg">
      Voting closes at <b>10:00 AM</b>.
      <br />
      Better luck tomorrow!
    </p>

    <div className="absolute right-0 top-0 h-full w-3 sm:w-5 md:w-5 candy-border"></div>

  </div>
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

  if (alreadyVotedError) {
  return (
  

<section className="container h-screen w-full flex justify-center items-center py-0 sm:py-15 lg:py-20">
        <div className="container bg-[#1D1D1D] rounded-[20px] px-10 py-24 text-center relative overflow-hidden max-w-full w-full">
          <h2 className="text-4xl text-red-400 mb-4">
          You Already Voted Today
        </h2>

          <p className="text-gray-300 text-lg">
            Each user can vote only once per day.
          </p>
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
        <p className="black-text">Loading questions...</p>
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

{todayCurator && (
  <p className="text-gray-400 text-sm mt-2">
    Curated by <span className="text-highlight font-semibold capitalize">
      {todayCurator.name}
    </span>{" "}
    for{" "}
   {new Date(todayCurator.date).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
})}
  </p>
)}

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

          <div className="flex flex-wrap items-center gap-6">

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

  {step === totalSteps - 1 && (
    <div className="w-full md:w-auto md:ml-auto">
      <Button
        onClick={saveVotes}
        text="Submit"
        className="text-white w-full md:w-auto"
      />
    </div>
  )}

</div>

 {showPinPopup && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-xl w-[300px]">
                    <h4 className=" font-semibold mb-4">
                      Enter Your 4 Digit PIN
                    </h4>

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
                      className="w-full bg-black text-white py-2 rounded cursor-pointer"
                    >
                      Verify
                    </button>

                   <button
  onClick={() => {
    setShowPinPopup(false);
    setPin("");
    setPendingSubmit(false);
  }}
  className="mt-2 w-full border py-2 rounded cursor-pointer"
>
  Cancel
</button>
                  </div>
                </div>
              )}

          </div>
        </div>

        <div className="absolute right-0 top-0 h-full w-3 sm:w-5 md:w-5 candy-border"></div>
      </div>
    </section>
  );
}
