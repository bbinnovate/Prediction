"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
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
};
export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function load() {
      const q = query(collection(db, "users"), orderBy("score", "desc"));
      const snap = await getDocs(q);

      const data = snap.docs.map((d, i) => ({
  id: d.id,
  avatar: avatars[i % avatars.length],
  ...d.data(),
  score: Number(d.data().score) || 0,
}));
      setUsers(data);
    }

    load();
  }, []);

  const top3 = users.slice(0, 3);
  const others = users.slice(3);

  return (
    <div className="container min-h-[calc(100vh-160px)] pt-32 pb-16">
      {/* TITLE */}

      <h1 className="text-4xl font-bold text-center mb-14 text-black">
        🏆Leaderboard
      </h1>

      {/* TOP 3 */}

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

      {/* TOP 3 PODIUM */}

    <div className="md:hidden flex justify-center items-end gap-10 mb-15 mt-20">

  {/* SECOND */}
  {top3[1] && (
    <div className="flex flex-col items-center translate-y-6">
      
      <div className="relative">
        <img
          src={top3[1].avatar}
          className="w-20 h-20 rounded-full border-4 border-blue-400"
        />

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
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
          className="w-24 h-24 rounded-full border-4 border-purple-500"
        />

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs w-7 h-7 rounded-full flex items-center justify-center">
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
          className="w-20 h-20 rounded-full border-4 border-indigo-400"
        />

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
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
              <th className="p-4">Score</th>
            </tr>
          </thead>

          <tbody>
            {others.map((u, i) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-semibold">#{i + 4}</td>

                <td className="p-4 flex items-center gap-3">
                  <img src={u.avatar} className="w-8 h-8 rounded-full" />
                  {u.name}
                </td>

                <td className="p-4 text-gray-600">{u.email}</td>

                <td className="p-4 font-bold text-[#fab31e]">{u.score || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST */}

      <div className="md:hidden space-y-3">
        {others.map((u, i) => (
          <div
            key={u.id}
            className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold">#{i + 4}</span>

              <img src={u.avatar} className="w-10 h-10 rounded-full" />

              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
            </div>

            <div className="font-bold text-[#fab31e]">{u.score || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
