"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
const avatars = [
  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
];

type User = {
  id: string;
  name?: string;
  email?: string;
  score?: number;
  avatar?: string;
  weekly?: string[];
};
export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
   async function load() {
  const q = query(collection(db, "users"), orderBy("score", "desc"));
  const snap = await getDocs(q);

  const votesSnap = await getDocs(collection(db, "votes"));
  const questionsSnap = await getDocs(collection(db, "questions"));

  const votes = votesSnap.docs.map((d) => d.data());

  const questions: any = {};
  questionsSnap.docs.forEach((d) => {
  questions[d.id] = d.data()?.correctAnswer ?? null;
  });

const data = snap.docs
.filter(d => d.data()?.name && d.data()?.email)
.map((d, i) => {
    const uid = d.id;

    const userVotes = votes.filter((v: any) => v.userId === uid);
    // remove duplicate answers for the same question
const uniqueVotes: any = {};

// collect unique votes per question
userVotes.forEach((v: any) => {
  uniqueVotes[v.questionId] = v;
});

const filteredVotes: any[] = Object.values(uniqueVotes);

  // sort votes so order is correct
filteredVotes.sort((a: any, b: any) => {
  const ta = a.createdAt?.seconds || new Date(a.createdAt).getTime();
  const tb = b.createdAt?.seconds || new Date(b.createdAt).getTime();
  return ta - tb;
});

const matches: number[] = [];
let correctCount = 0;
let questionCount = 0;

filteredVotes.forEach((v: any) => {
  const correctAnswer = questions[v.questionId];

const userAns = String(v.answer).trim().toLowerCase();
const correctAns = String(correctAnswer).trim().toLowerCase();

if (userAns === correctAns) {
  correctCount++;
}

  questionCount++;

  // every 4 questions = 1 match
  if (questionCount === 4) {
    matches.push(correctCount);
    correctCount = 0;
    questionCount = 0;
  }
});

// only keep 5 matches
const weekly = [];

for (let i = 0; i < 5; i++) {
  weekly.push(`${matches[i] || 0}/4`);
}

    return {
      id: d.id,
      avatar: avatars[i % avatars.length],
      ...d.data(),
      score: Number(d.data().score) || 0,
      weekly,
    };
  });

  setUsers(data);
}
    load();
  }, []);

  const top3 = users.slice(0, 3);
  const others = users.slice(3);

  const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

  return (
    <div className="container min-h-[calc(100vh-160px)] pt-28 pb-16">
      {/* TITLE */}

      {/* TOP 3 dextop */}
<div className="text-center mb-8">
  <h2 className="text-3xl font-bold">🏆 Highest Scores</h2>
  <p className="text-gray-500 mt-1">{today}</p>
</div>
      <div className=" hidden md:flex flex flex-col md:flex-row justify-center items-end gap-6 mb-20">
        {/* SECOND */}

        {top3[1] && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white shadow-xl rounded-xl p-6 w-60 text-center border"
          >
            <div className="text-3xl mb-2">🥈</div>

            <img
              src={top3[1].avatar}
              className="w-16 h-16 rounded-full mx-auto mb-2"
            />

            <p className="font-semibold text-lg">{top3[1].name}</p>
            <p className="text-gray-500 text-sm">{top3[1].email}</p>

            <p className="mt-3 text-[#fab31e] font-bold text-xl">
              {top3[1].score || 0}
            </p>
          </motion.div>
        )}

        {/* FIRST */}

        {top3[0] && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-[#fab31e] text-white shadow-2xl rounded-xl p-8 w-72 text-center"
          >
            <div className="text-4xl mb-2">👑</div>

            <img
              src={top3[0].avatar}
              className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white"
            />

            <p className="text-xl font-bold">{top3[0].name}</p>
            <p className="text-sm opacity-90">{top3[0].email}</p>

            <p className="mt-4 text-2xl font-bold">{top3[0].score || 0}</p>
          </motion.div>
        )}

        {/* THIRD */}

        {top3[2] && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white shadow-xl rounded-xl p-6 w-60 text-center border"
          >
            <div className="text-3xl mb-2">🥉</div>

            <img
              src={top3[2].avatar}
              className="w-16 h-16 rounded-full mx-auto mb-2"
            />

            <p className="font-semibold text-lg">{top3[2].name}</p>
            <p className="text-gray-500 text-sm">{top3[2].email}</p>

            <p className="mt-3 text-[#fab31e] font-bold text-xl">
              {top3[2].score || 0}
            </p>
          </motion.div>
        )}
      </div>

      {/* TOP 3 PODIUM mobile */}

    <div className="md:hidden flex justify-center items-end gap-10 mb-15 mt-20">

  {/* SECOND */}
  {top3[1] && (
    <div className="flex flex-col items-center translate-y-6">
      
      <div className="relative">
        <img
          src={top3[1].avatar}
          className="w-20 h-20 rounded-full border-4 border-[#fab31e]"
        />

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#fab31e] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
          2
        </div>
      </div>

      <p className="text-sm font-semibold mt-2">{top3[1].name}</p>
      <p className="text-xs text-gray-500">{top3[1].score} points</p>
    </div>
  )}

  {/* FIRST */}
  {top3[0] && (
    <div className="flex flex-col items-center -mt-15">

      <div className="text-2xl ">👑</div>

      <div className="relative">
        <img
          src={top3[0].avatar}
          className="w-24 h-24 rounded-full border-4 border-[#fab31e]"
        />

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#fab31e] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center">
          1
        </div>
      </div>

      <p className="font-bold mt-2">{top3[0].name}</p>
      <p className="text-sm text-gray-500">{top3[0].score} points</p>
    </div>
  )}

  {/* THIRD */}
  {top3[2] && (
    <div className="flex flex-col items-center translate-y-6">

      <div className="relative">
        <img
          src={top3[2].avatar}
          className="w-20 h-20 rounded-full border-4 border-[#fab31e]"
        />

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#fab31e] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
          3
        </div>
      </div>

      <p className="text-sm font-semibold mt-2">{top3[2].name}</p>
      <p className="text-xs text-gray-500">{top3[2].score} points</p>
    </div>
  )}

</div>

      {/* DESKTOP TABLE */}

      <div className="hidden md:block overflow-x-auto bg-white shadow-lg rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-[#fab31e] text-white">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">Player</th>
              <th className="p-4">Email</th>
              {/* <th className="p-4">Last 5 Days</th> */}
              <th className="p-4">Score</th>
            </tr>
          </thead>

          <tbody>
  {users.map((u, i) => (
   <tr key={u.id} className="border-t hover:bg-gray-50">
  <td className="p-4 font-semibold">#{i + 1}</td>

  <td className="p-4 flex items-center gap-3">
    <img src={u.avatar} className="w-8 h-8 rounded-full" />
    {u.name}
  </td>

  <td className="p-4 text-gray-600">{u.email}</td>

  {/* <td className="p-4 text-gray-700">
    {u.weekly?.join("  |  ") || "0/4 | 0/4 | 0/4 | 0/4 | 0/4"}
  </td> */}
<td className="p-4 font-bold text-[#fab31e]">
<div className="flex items-center gap-2 text-[#fab31e] font-bold">
  <img
    src="https://cdn-icons-png.flaticon.com/512/2933/2933116.png"
    className="w-4 h-4"
  />
  {u.score || 0}
</div>
</td>

</tr>
  ))}
</tbody>
        </table>
      </div>

      {/* MOBILE LIST */}

      <div className="md:hidden space-y-3">
        {users.map((u, i) => (
          <div
            key={u.id}
            className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold">#{i + 1}</span>

              <img src={u.avatar} className="w-10 h-10 rounded-full" />

              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-bold text-[#fab31e]">
  <img
    src="https://cdn-icons-png.flaticon.com/512/2933/2933116.png"
    className="w-4 h-4"
  />
  {u.score || 0}
</div>
          </div>
        ))}
      </div>
    </div>
  );
}
