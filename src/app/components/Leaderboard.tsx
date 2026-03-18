"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy ,limit } from "firebase/firestore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
    const q = query(
      collection(db, "users"),
      orderBy("score", "desc"),
      limit(50)
    );

    const snap = await getDocs(q);

   const data = snap.docs.map((d, i) => {
  const docData = d.data();

  return {
    id: d.id,

    avatar:
      docData.photo && docData.photo.trim() !== ""
        ? docData.photo
        : avatars[i % avatars.length],

    name: docData.name || "Anonymous",

    // ❌ REMOVE EMAIL (see next point)
    email: docData.email || "No Email",

    score: Number(docData.score) || 0,
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

<div className="hidden md:flex flex-col md:flex-row justify-center items-end gap-6 mb-20 w-full max-w-5xl mx-auto">        {/* SECOND */}

        {top3[1] && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white shadow-xl rounded-[20px] p-6 w-[45%] md:w-64 text-center border flex-shrink-0"
          >
            <div className="text-3xl mb-2">🥈</div>

            <img
              src={top3[1].avatar}
              className="w-16 h-16 rounded-full mx-auto mb-2"
            />

            <p className="font-semibold text-lg">{top3[1].name}</p>
            <p className="text-gray-500 text-sm">{top3[1].email}</p>

            <p className="mt-3 flex items-center justify-center gap-2 text-[#fab31e] font-bold text-xl">
  <img
    src="https://cdn-icons-png.flaticon.com/512/2933/2933116.png"
    className="w-5 h-5"
  />
              {top3[1].score || 0}
            </p>
          </motion.div>
        )}

        {/* FIRST */}

        {top3[0] && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
className="bg-[#fab31e] text-white shadow-2xl rounded-[20px] p-8 w-[55%] md:w-80 text-center flex-shrink-0"          >
            <div className="text-4xl ">👑</div>

            <img
              src={top3[0].avatar}
              className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white"
            />

            <p className="text-xl font-bold">{top3[0].name}</p>
            <p className="text-sm opacity-90">{top3[0].email}</p>

            <p className="mt-3 flex items-center justify-center gap-2 text-white font-bold text-xl">
  <img
    src="https://cdn-icons-png.flaticon.com/512/2933/2933116.png"
    className="w-5 h-5"
  />{top3[0].score || 0}</p>
          </motion.div>
        )}

        {/* THIRD */}

        {top3[2] && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
className="bg-white shadow-xl rounded-[20px] p-6 w-[45%] md:w-64 text-center border flex-shrink-0"          >
            <div className="text-3xl mb-2">🥉</div>

            <img
              src={top3[2].avatar}
              className="w-16 h-16 rounded-full mx-auto mb-2"
            />

            <p className="font-semibold text-lg">{top3[2].name}</p>
            <p className="text-gray-500 text-sm">{top3[2].email}</p>

            <p className="mt-3 flex items-center justify-center gap-2 text-[#fab31e] font-bold text-xl">
  <img
    src="https://cdn-icons-png.flaticon.com/512/2933/2933116.png"
    className="w-5 h-5"
  />
              {top3[2].score || 0}
            </p>
          </motion.div>
        )}
      </div>

      {/* TOP 3 PODIUM mobile */}

<div className="md:hidden flex justify-center items-end gap-6 mb-12 mt-16">

  {/* SECOND */}
  {top3[1] && (
    <div className="flex flex-col items-center translate-y-4 w-[90px] text-center">

      <div className="relative">
        <img
          src={top3[1].avatar}
          className="w-20 h-20 rounded-full border-4 border-[#fab31e]"
        />

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#fab31e] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
          2
        </div>
      </div>

      <p className="text-xs font-semibold mt-2 truncate w-full">
        {top3[1].name}
      </p>

      <p className="flex items-center justify-center gap-1 text-xs text-[#fab31e] font-semibold">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2933/2933116.png"
          className="w-3.5 h-3.5"
        />
        {top3[1].score || 0}
      </p>

    </div>
  )}

  {/* FIRST */}
  {top3[0] && (
    <div className="flex flex-col items-center -mt-10 w-[100px] text-center">

      <div className="text-3xl ">👑</div>

      <div className="relative">
        <img
          src={top3[0].avatar}
          className="w-24 h-24 rounded-full border-4 border-[#fab31e]"
        />

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#fab31e] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center">
          1
        </div>
      </div>

      <p className="text-sm font-bold mt-2 truncate w-full">
        {top3[0].name}
      </p>

      <p className="flex items-center justify-center gap-1 text-xs text-[#fab31e] font-semibold">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2933/2933116.png"
          className="w-3.5 h-3.5"
        />
        {top3[0].score || 0}
      </p>

    </div>
  )}

  {/* THIRD */}
  {top3[2] && (
    <div className="flex flex-col items-center translate-y-4 w-[90px] text-center">

      <div className="relative">
        <img
          src={top3[2].avatar}
          className="w-20 h-20 rounded-full border-4 border-[#fab31e]"
        />

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#fab31e] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
          3
        </div>
      </div>

      <p className="text-xs font-semibold mt-2 truncate w-full">
        {top3[2].name}
      </p>

      <p className="flex items-center justify-center gap-1 text-xs text-[#fab31e] font-semibold">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2933/2933116.png"
          className="w-3.5 h-3.5"
        />
        {top3[2].score || 0}
      </p>

    </div>
  )}

</div>

      {/* DESKTOP TABLE */}

      <div className="hidden md:block overflow-x-auto bg-white shadow-lg rounded-[20px]">
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

  <td className="p-4 flex items-center gap-3 capitalize">
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
            className="bg-white shadow rounded-[20px] p-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold">#{i + 1}</span>

              <img src={u.avatar} className="w-10 h-10 rounded-full" />

              <div>
                <p className="font-medium capitalize">{u.name}</p>
               <p className="text-[10px] text-gray-500">{u.email}</p>
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
