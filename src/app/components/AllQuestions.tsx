"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Question = {
  curatorId: any;
  id: string;
  question: string;
  correctAnswer?: string;
  date: string;
};

export default function AllQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [pageLoading, setPageLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [curatorName, setCuratorName] = useState("");

  const router = useRouter();

  // 🔐 ADMIN CHECK (supports auth + PIN)
  useEffect(() => {
    const checkAdmin = async () => {
      let uid: string | null = null;

      const user = auth.currentUser;
      if (user) uid = user.uid;

      if (!uid) {
        const pinUser = localStorage.getItem("pinUser");
        if (pinUser) uid = JSON.parse(pinUser).uid;
      }

      if (!uid) return router.push("/");

      const snap = await getDoc(doc(db, "users", uid));

      if (!snap.exists() || snap.data().role !== "admin") {
        router.push("/");
        return;
      }

      setPageLoading(false);
    };

    checkAdmin();
  }, []);

  // 🔥 LOAD ALL DATES
  useEffect(() => {
    const loadDates = async () => {
      const snap = await getDocs(collection(db, "questions"));

      const allDates = snap.docs
        .map((d) => d.data().date)
        .filter(Boolean);

      const uniqueDates = [...new Set(allDates)].sort().reverse();

      setDates(uniqueDates);

      if (uniqueDates.length > 0) {
        loadQuestions(uniqueDates[0]);
      }
    };

    loadDates();
  }, []);

const loadQuestions = async (date: string) => {
  if (!date) {
    console.warn("No date provided");
    setQuestions([]);
    return;
  }

  const q = query(
    collection(db, "questions"),
    where("date", "==", date)
  );

  const snap = await getDocs(q);

  const data: Question[] = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  }));


  // 👉 GET curatorId from first question
  const curatorId = data[0]?.curatorId;

  if (curatorId) {
    const userSnap = await getDoc(doc(db, "users", curatorId));

    if (userSnap.exists()) {
      setCuratorName(userSnap.data().name || "Unknown");
    } else {
      setCuratorName("Unknown");
    }
  } else {
    setCuratorName("Unknown");
  }

  const seen = new Set();
  const unique: Question[] = [];

  for (const q of data) {
    const text = q.question?.trim().toLowerCase();

    if (!seen.has(text)) {
      seen.add(text);
      unique.push(q);
    }
  }

  setQuestions(unique.slice(0, 4));
};

  // ⬅️➡️ DATE NAV
  const nextDate = () => {



        if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      loadQuestions(dates[prev]);
    }
  };

  const prevDate = () => {
    if (currentIndex < dates.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      loadQuestions(dates[next]);
    }
  };

  if (pageLoading) {
    return (
      <section className="h-screen flex items-center justify-center">
        <p>Loading...</p>
      </section>
    );
  }

  const currentDate = dates[currentIndex] || "";


  return (
    <section className=" container min-h-[calc(100vh-160px)] lg:pt-40 pt-30 lg:py-20 md:py-15 py-10 ">

      <h1 className="text-2xl font-bold text-center mb-6">
        All Questions 
      </h1>

      {/* DATE NAV */}
      <div className="flex justify-center items-center gap-4 mb-6">

        <button
          onClick={prevDate}
         
           disabled={currentIndex === dates.length - 1}
          className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-30 cursor-pointer"
        >
          {"<"}
        </button>

        <input
          type="date"
          value={currentDate}
          onChange={(e) => {
            const index = dates.indexOf(e.target.value);
            if (index !== -1) {
              setCurrentIndex(index);
              loadQuestions(e.target.value);
            }
          }}
          className="px-4 py-2 border rounded"
        />

        <button
          onClick={nextDate}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-30 cursor-pointer"
        >
          {">"}
        </button>

      </div>

        {/* CURATOR */}
          <p className="text-center text-gray-400 mb-4">
            Curated by{" "}
            <span className="text-[#fab31e] font-semibold capitalize">
              {curatorName}
            </span>
          </p>

      {/* EMPTY */}
      {questions.length === 0 && (
              <section className="container w-full flex justify-center items-center py-0 sm:py-15 lg:py-20">
        <div className="container bg-[#1D1D1D] rounded-[20px] px-10 py-24 text-center relative overflow-hidden max-w-full w-full">
          <h2 className="text-4xl text-red-400 mb-4"> Question is not available for the date</h2>

          {/* <p className="text-gray-300 text-lg">
            Voting closes at <b>10:30 AM</b>.
            <br />
            Better luck tomorrow!
          </p> */}

          <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-6 h-full bg-[#FAB31E]"></div>
        </div>
      </section>
      )}

      {/* QUESTIONS LIST */}
      {questions.length > 0 && (
        <div
            className="bg-[#1D1D1D] text-white rounded-[20px] space-y-6 relative overflow-hidden"
          >

         <AnimatePresence mode="wait">
  <motion.div
    key={currentDate}
    initial={{ opacity: 0, x: 80 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -80 }}
    transition={{ duration: 0.3 }}
    className="bg-[#1D1D1D] text-white rounded-[20px] px-8 py-8 space-y-4 relative"
  >
    {questions.map((q, i) => (
      <div key={q.id} className="border-b border-gray-600 pb-3">
        <p className="font-medium">
          {i + 1}. {q.question}
        </p>

        <p className="text-sm text-[#fab31e] mt-1">
          Answer: {q.correctAnswer || "Not answered"}
        </p>
      </div>
    ))}

    {/* Right stripe (your style) */}
    {/* <div className="absolute -right-1 top-0 w-4 h-full bg-[#FAB31E]"></div> */}
  </motion.div>
</AnimatePresence>

            <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-6 h-full bg-[#FAB31E]"></div>


         
          </div>

      )}

      
    </section>
  );
}