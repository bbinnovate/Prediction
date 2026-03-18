"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { increment, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Button from "./Button";
import { Eye, EyeOff } from "lucide-react";
import PredictionButton from "./PredictionButton";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { runTransaction } from "firebase/firestore";

type Question = {
  id: string;
  question: string;
  correctAnswer?: string;
};

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [finished, setFinished] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Progress calculations
  const totalSteps = questions?.length || 0;

  // They want the percentage text to hit 100% on the last question (step === totalSteps - 1).
const answeredCount = Object.keys(answers).length;

const progressPercentage =
  totalSteps > 0 ? Math.round((answeredCount / totalSteps) * 100) : 0;
  const [role, setRole] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [pin, setPin] = useState("");
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [alreadyVotedError, setAlreadyVotedError] = useState(false);
  const [todayCurator, setTodayCurator] = useState<any>(null);
  const [checkingVote, setCheckingVote] = useState(true);
  const [timeExpired, setTimeExpired] = useState(false);
  const [notStarted, setNotStarted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [globalTimeLeft, setGlobalTimeLeft] = useState("");
  const [pinError, setPinError] = useState("");
  const [timeProgress, setTimeProgress] = useState(0);
  const [hasVotedState, setHasVotedState] = useState<boolean | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();

      const start = new Date();
      start.setHours(6, 0, 0, 0);

      const end = new Date();
      end.setHours(10, 30, 0, 0);

      // Only show active timer between 6 AM and 10:30 AM
      if (now < start || now >= end) {
        return "00:00:00";
      }

      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        return "00:00:00";
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    setGlobalTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setGlobalTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (checkingRole || checkingVote || finished) return;

    const loadQuestions = async () => {
      const q = query(
        collection(db, "questions"),
        orderBy("createdAt", "desc"),
        limit(20), // fetch more so we can remove duplicates safely
      );

      const snap = await getDocs(q);

      const raw: Question[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Question, "id">),
      }));

const seen = new Set<string>();
const unique: Question[] = [];

for (const q of raw) {
  const text = q.question?.trim().toLowerCase();

  if (!seen.has(text)) {
    seen.add(text);
    unique.push(q);
  }

  // ✅ STOP once we have 4 UNIQUE
  if (unique.length === 4) break;
}

setQuestions(unique);
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
    audio.volume = 0.1;

    audio.play().catch(() => {});

    const stopTimer = setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 5000);

    return () => clearTimeout(stopTimer);
  }, [finished]);

  useEffect(() => {
    const loadCurator = async () => {
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
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

  // Quiz timer effect
  useEffect(() => {
    if (!quizStarted || finished || step >= totalSteps) return;

    if (timeLeft === 0) {
      const qid = questions[step].id;

      const updatedAnswers = {
        ...answers,
        [qid]: "",
      };

      setAnswers(updatedAnswers);

      const isLastQuestion = step === totalSteps - 1;

      if (isLastQuestion) {
        let uid: any = null;

        const user = auth.currentUser;
        if (user) uid = user.uid;

        const pinUser = localStorage.getItem("pinUser");
        if (!uid && pinUser) {
          uid = JSON.parse(pinUser).uid;
        }

        if (uid) {
          submitVotes(uid);
        }

        return;
      }

      handleAutoAdvance();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, finished, step, totalSteps, questions]);

  useEffect(() => {
  if (!quizStarted) return;

  setTimeProgress(0);

  const interval = setInterval(() => {
    setTimeProgress((prev) => {
      const next = prev + 10; // 1000ms / 10s
      return next > 100 ? 100 : next;
    });
  }, 100);

  return () => clearInterval(interval);
}, [step, quizStarted]);

  // Time window check
  useEffect(() => {
    const checkTimeAndVote = async () => {

      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      // BEFORE 6 AM
      if (hour < 6) {
        setNotStarted(true);
        return;
      }

      // AFTER 10:30 AM
      if (hour > 10 || (hour === 10 && minute >= 30)) {

        let uid: any = null;

        const user = auth.currentUser;
        if (user) uid = user.uid;

        const pinUser = localStorage.getItem("pinUser");
        if (!uid && pinUser) {
          uid = JSON.parse(pinUser).uid;
        }

        if (uid) {

          const voted = await hasVotedToday(uid);

          if (voted) {
            setAlreadyVotedError(true);
          } else {
            setTimeExpired(true);
          }

        } else {
          setTimeExpired(true);
        }

        return;
      }

    };

    checkTimeAndVote();
  }, []);

const hasVotedToday = async (uid: any) => {
  try {
    if (hasVotedState !== null) return hasVotedState;

    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

    const q = query(
      collection(db, "votes"),
      where("userId", "==", uid),
      where("date", "==", today),
      limit(1)
    );

    const snap = await getDocs(q);

    const result = !snap.empty;

    setHasVotedState(result);

    return result;

  } catch (err) {
    console.error("Vote check failed:", err);
    return false;
  }
};

const submitVotes = async (uid: any) => {

  // 🚫 prevent double submit
  if (finished) return;

  setFinished(true);

  try {
const today = new Date().toLocaleDateString("en-CA");
  const dayIndex = new Date().getDay(); 
    // ✅ SAVE VOTES (unique per user + question)
    await Promise.all(
      Object.keys(answers).map((qid) =>
        setDoc(doc(db, "votes", `${uid}_${today}_${qid}`), {
          userId: uid,
          questionId: qid,
          answer: answers[qid],
          date: today, 
          createdAt: new Date(),
        })
      )
    );

    // ✅ CALCULATE SCORE
await updateDoc(doc(db, "users", uid), {
  lastPlayed: today,
});

    // ✅ CLEANUP SESSION
    localStorage.removeItem("pinUser");
    await auth.signOut().catch(() => {});
    window.dispatchEvent(new Event("pin-logout"));

  } catch (err) {
    console.error("Vote error:", err);
    alert("Failed to submit votes");
  }



// 1 = Monday ... 5 = Friday


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
      setPinError("Enter 4 digit PIN");
      return;
    }

    try {
      // check pin document
      const pinSnap = await getDoc(doc(db, "pinLogin", pin));

      if (!pinSnap.exists()) {
        setPinError("Invalid PIN");
        return;
      }

      const uid = pinSnap.data()?.uid;

      if (!uid) {
        setPinError("PIN not linked to user");
        return;
      }

      // verify user actually exists
      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) {
        setPinError("User not found for this PIN");
        return;
      }

      const userData = userSnap.data();

      // store session
      localStorage.setItem(
        "pinUser",
        JSON.stringify({
          uid,
          role: userData.role || "user",
          name: userData.name || "",
        }),
      );

      window.dispatchEvent(new Event("pin-login"));

      setShowPinPopup(false);
      setPin("");

      // start quiz only after valid login
      setQuizStarted(true);
      setTimeLeft(10);
    } catch (err) {
      console.error(err);
      setPinError("Verification failed");
    }
  };

  const selectAnswer = async (qid: any, value: any) => {
    const updatedAnswers = {
      ...answers,
      [qid]: value,
    };

    setAnswers(updatedAnswers);

    const messages = [
      "First question answered ✅",
      "Second question answered ✅",
      "Third question answered ✅",
      "All questions answered 🎉",
    ];

    toast.success(messages[step], {
      duration: 1500,
    });

    const isLastQuestion = step === totalSteps - 1;

    if (isLastQuestion) {
      let uid: any = null;

      const user = auth.currentUser;
      if (user) uid = user.uid;

      const pinUser = localStorage.getItem("pinUser");
      if (!uid && pinUser) {
        uid = JSON.parse(pinUser).uid;
      }

      if (uid) {
        const userSnap = await getDoc(doc(db, "users", uid));

        if (!userSnap.exists()) {
          console.error("Invalid user attempting vote");
          return;
        }

        await submitVotes(uid);
      }

      return;
    }

    handleAutoAdvance();
  };

  const handleAutoAdvance = () => {
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
      setTimeLeft(10); // reset timer
    }
    // we don't automatically submit here anymore as requested, user clicks Submit manually on last question
  };

  const startQuiz = async () => {
    let uid: any = null;

    const user = auth.currentUser;
    if (user) uid = user.uid;

    const pinUser = localStorage.getItem("pinUser");
    if (!uid && pinUser) {
      uid = JSON.parse(pinUser).uid;
    }

    // USER NOT LOGGED IN → show PIN
    if (!uid) {
      setShowPinPopup(true);
      return;
    }

    // CHECK IF ALREADY VOTED
    const voted = await hasVotedToday(uid);

    if (voted) {
      setAlreadyVotedError(true);
      return;
    }

    // START QUIZ
    setQuizStarted(true);
    setTimeLeft(10);
  };

  if (notStarted) {
    return (
      <section className="container h-screen w-full flex justify-center items-center py-0 sm:py-15 lg:py-20">
        <div className="container bg-[#1D1D1D] rounded-[20px] px-10 py-24 text-center relative overflow-hidden max-w-full w-full">
          <h2 className="text-4xl text-yellow-400 mb-4">
            Voting starts at 6:00 AM ⏰
          </h2>

          <p className="text-gray-300 text-lg">Come back later!</p>
          <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-6 h-full bg-[#FAB31E]"></div>
        </div>
      </section>
    );
  }

  if (checkingRole) {
    return (
      <section className="container h-screen w-full flex justify-center items-center py-0 sm:py-15 lg:py-20">
        <p className="black-text">Loading...</p>
      </section>
    );
  }

  if (timeExpired && !finished) {
    return (
      <section className="container h-screen w-full flex justify-center items-center py-0 sm:py-15 lg:py-20">
        <div className="container bg-[#1D1D1D] rounded-[20px] px-10 py-24 text-center relative overflow-hidden max-w-full w-full">
          <h2 className="text-4xl text-red-400 mb-4">Oops! You missed it ⏰</h2>

          <p className="text-gray-300 text-lg">
            Voting closes at <b>10:30 AM</b>.
            <br />
            Better luck tomorrow!
          </p>

          <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-6 h-full bg-[#FAB31E]"></div>
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
           <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-6 h-full bg-[#FAB31E]"></div>
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

          <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-6 h-full bg-[#FAB31E]"></div>
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
      className="container h-screen flex items-center justify-center py-20 sm:py-15 lg:py-20 "
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1D1D1D",
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "14px",
          },
        }}
      />
      <div className="max-w-full w-full container bg-[#1D1D1D] rounded-[20px] relative overflow-hidden px-6 py-8">
        <div className="max-w-3xl mx-auto text-center lg:mb-6 mb-3">
          {quizStarted && (
            <>
              <h2 className="text-3xl font-medium text-white">
                Office <span className="text-highlight">Predictions</span>
              </h2>

              {todayCurator && (
                <p className="text-gray-400 text-sm mt-2">
                  Curated by{" "}
                  <span className="text-highlight font-semibold capitalize">
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
            </>
          )}

          <div className="mt-6">
            {quizStarted && (
              <>
               <div className="flex gap-3 items-center">

  {Array.from({ length: totalSteps }).map((_, idx) => {

    const answeredCount = Object.keys(answers).length;

    // completed questions
    if (idx < answeredCount) {
      return (
        <div key={idx} className="flex-1 h-2 rounded-full bg-[#fab31e]" />
      );
    }

    // current active question
    if (idx === step) {
      return (
        <div key={idx} className="flex-1 h-2 rounded-full border border-gray-600 overflow-hidden">
          <motion.div
            className="h-full bg-[#fab31e] "
            initial={{ width: "0%" }}
            animate={{ width: `${timeProgress}%` }}
            transition={{ ease: "linear", duration: 10 }}
          />
        </div>
      );
    }

    // future questions
    return (
      <div key={idx} className="flex-1 h-2 rounded-full border border-gray-600" />
    );

  })}

</div>

                <div className="mt-3 text-sm text-gray-300 flex justify-between">
                  <div>
                    Step {step + 1} of {totalSteps}
                  </div>

                  <div className="text-highlight">{progressPercentage}%</div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="lg:py-0 py-1 lg:mb-5 mb-0 ">
            {!quizStarted ? (
              <div className="flex flex-col items-center justify-center ">
                <h3 className="text-xl text-white text-center w-full">
                  Ready to start the predictions?
                </h3>

                <div className="my-6 text-center">
                  <p className="text-[#fab31e] font-bold text-5xl mb-2">
                    {globalTimeLeft}
                  </p>
                  {/* <p className="text-gray-300 text-lg">Time is going, answer the questions fast!</p> */}
                </div>

                <p className="text-gray-400 text-center">
                  You will have 10 seconds per question.
                </p>
                <Button
                  text="Start Prediction"
                  onClick={startQuiz}
                  className="white-text mt-4"
                />
              </div>
            ) : (
              // Quiz content
              <>
                {step < totalSteps && current && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">

  {/* TIMER */}
  <div className="order-1 sm:order-2 flex justify-end sm:justify-start">
    <div
      className={`text-lg font-bold px-3 py-1 rounded-full ${
        timeLeft <= 3
          ? "text-red-500 bg-red-500/10"
          : "text-highlight bg-highlight/10"
      }`}
    >
      00:{timeLeft.toString().padStart(2, "0")}
    </div>
  </div>

  {/* QUESTION */}
  <div className="order-2 sm:order-1">
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ x: 120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -120, opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <h3 className="text-white text-left break-words leading-relaxed max-w-2xl text-lg sm:text-xl md:text-2xl">
          {current.question}
        </h3>
      </motion.div>
    </AnimatePresence>
  </div>

</div>

                    <PredictionButton
                      onYes={() => selectAnswer(current.id, "yes")}
                      onNo={() => selectAnswer(current.id, "no")}
                    />
                  </>
                )}
              </>
            )}

            {/* We no longer use step === totalSteps so the above submit works directly on the last step */}

            {showPinPopup && (
              <div
                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                onClick={() => {
                  setShowPinPopup(false);
                  setPin("");
                  setPinError("");
                  setPendingSubmit(false);
                }}
              >
                <div
                  className="bg-white p-6 rounded-[20px] w-[400px] max-w-[90%]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="font-semibold mb-4 text-center">
                    Enter Your 4 Digit PIN
                  </h4>

                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="4 Digit PIN"
                      maxLength={4}
                      className="w-full border p-2 rounded mb-2  tracking-widest"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black opacity-80 hover:opacity-100 transition cursor-pointer"
                    >
                      {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {pinError && (
                    <p className="text-red-500 text-sm mb-3 ">{pinError}</p>
                  )}

                  <Button
                    onClick={verifyPin}
                    className="black-text"
                    text="Verify"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-6 h-full bg-[#FAB31E]"></div>
      </div>
    </section>
  );
}
