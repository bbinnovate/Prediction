"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy ,limit } from "firebase/firestore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { onSnapshot } from "firebase/firestore";
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
  const q = query(
    collection(db, "users"),
    orderBy("score", "desc"),
    limit(50)
  );

  const unsub = onSnapshot(q, (snap) => {
    const data = snap.docs.map((d, i) => {
      const docData = d.data();

      return {
        id: d.id,
       avatar:
  docData.photo && docData.photo.trim() !== ""
    ? docData.photo
    : avatars[i % avatars.length],
        name: docData.name || "Anonymous",
        email: docData.email || "No Email",
        weekly: docData.weekly || ["0/4","0/4","0/4","0/4","0/4"],
        score: Number(docData.score) || 0,
      };
    });

    setUsers(data);
  });

  return () => unsub();
}, []);

  const top3 = users.slice(0, 3);
  const others = users.slice(3);

  const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});


// 🇮🇳 India time
const now = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
);

// get day (0=Sun, 1=Mon...)
const day = now.getDay();

// convert to Monday-based index (Mon=0, Fri=4)
const mondayIndex = day === 0 ? 6 : day - 1;

// get current Monday (start of this week)
const currentMonday = new Date(now);
currentMonday.setDate(now.getDate() - mondayIndex);
currentMonday.setHours(0, 0, 0, 0);

// 🔥 FIXED START DATE (IMPORTANT)
// set this to your system start Monday (VERY IMPORTANT)
const systemStart = new Date("2025-01-06"); // Monday

// difference in weeks
const diffTime = currentMonday.getTime() - systemStart.getTime();
const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

// 2-week cycle (1 or 2)
const cycle = diffWeeks % 3;

// 0 → week1 current
// 1 → week2 current
// 2 → reset cycle

const currentWeekIndex = cycle === 0 ? 1 : cycle === 1 ? 2 : 1;
const lastWeekIndex = currentWeekIndex === 1 ? 2 : 1;

const getWeekLabel = (weekNumber: number) => {
  if (weekNumber === currentWeekIndex) return "Current Week";
  if (weekNumber === lastWeekIndex) return "Last Week";
  return "Coming Week";
};

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
            className="bg-white shadow-xl rounded-[20px] p-6 w-[45%] md:w-64 text-center border  flex-shrink-0"
          >
            <div className="text-3xl mb-2">🥈</div>

            <img
              src={top3[1].avatar}
              className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
            />

            <p className="font-semibold text-lg">{top3[1].name}</p>
            {/* <p className="text-gray-500 text-sm">{top3[1].email}</p> */}

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
              className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white object-cover"
            />

            <p className="text-xl font-bold">{top3[0].name}</p>
            {/* <p className="text-sm opacity-90">{top3[0].email}</p> */}

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
              className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
            />

            <p className="font-semibold text-lg">{top3[2].name}</p>
            {/* <p className="text-gray-500 text-sm">{top3[2].email}</p> */}

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
          className="w-20 h-20 rounded-full border-4 border-[#fab31e] object-cover"
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
          className="w-24 h-24 rounded-full border-4 border-[#fab31e] object-cover"
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
          className="w-20 h-20 rounded-full border-4 border-[#fab31e] object-cover"
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
  <table className="w-full text-left border-collapse">
    
    {/* HEADER */}
<thead className="bg-[#fab31e] text-white">
  <tr>
    <th className="p-4 border-r border-black" rowSpan={2}>Rank</th>
    <th className="p-4 border-r border-black" rowSpan={2}>Player</th>

    {/* Week 1 */}
<th className="py-2 text-center  border-r border-black" colSpan={5}>
  {getWeekLabel(2)}
</th>
   <th className="py-2 text-center" colSpan={5}>
  {getWeekLabel(1)}
</th>


    <th className="p-4 border-l border-black" rowSpan={2}>Score</th>
  </tr>

  <tr>
    {/* WEEK 1 */}
    <th className="p-2 text-center">Mon</th>
    <th className="p-2 text-center">Tue</th>
    <th className="p-2 text-center">Wed</th>
    <th className="p-2 text-center">Thu</th>
    <th className="p-2 text-center border-r border-black">Fri</th>

    {/* WEEK 2 */}
    <th className="p-2 text-center">Mon</th>
    <th className="p-2 text-center">Tue</th>
    <th className="p-2 text-center">Wed</th>
    <th className="p-2 text-center">Thu</th>
    <th className="p-2 text-center">Fri</th>
  </tr>
</thead>

    {/* BODY */}
    <tbody>
      {users.map((u, i) => {
        const week1 = u.weekly?.slice(0, 5) || ["0/4","0/4","0/4","0/4","0/4"];
        const week2 =
  u.weekly && u.weekly.length >= 10
    ? u.weekly.slice(5, 10)
    : ["0/4","0/4","0/4","0/4","0/4"];

        return (
        <tr key={u.id} className="border-t hover:bg-gray-50 text-center">

  {/* RANK */}
  <td className="p-4 font-semibold border-r border-black">
    #{i + 1}
  </td>

  {/* PLAYER */}
  <td className="p-4 flex items-center gap-3 capitalize text-left border-r border-black">
    <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" />
    {u.name}
  </td>

  {/* WEEK 1 */}
  {week1.map((d, idx) => (
    <td
      key={"w1-" + idx}
      className={`p-3 ${idx === 4 ? "border-r border-black" : ""}`}
    >
      {d}
    </td>
  ))}

  {/* WEEK 2 */}
  {week2.map((d, idx) => (
    <td key={"w2-" + idx} className="p-3">
      {d}
    </td>
  ))}

  {/* SCORE */}
  <td className="p-4 font-bold text-[#fab31e] border-l border-black">
    <div className="flex items-center justify-center gap-2">
      <img
        src="https://cdn-icons-png.flaticon.com/512/2933/2933116.png"
        className="w-4 h-4"
      />
      {u.score || 0}
    </div>
  </td>

</tr>
        );
      })}
    </tbody>

  </table>
</div>

      {/* MOBILE LIST */}

     <div className="md:hidden space-y-3">
  {users.map((u, i) => {
   const weekA = u.weekly?.slice(0, 5) || ["0/4","0/4","0/4","0/4","0/4"];
const weekB = u.weekly?.slice(5, 10) || ["0/4","0/4","0/4","0/4","0/4"];

// rotate based on current week
const currentWeek = currentWeekIndex === 1 ? weekA : weekB;
const lastWeek = currentWeekIndex === 1 ? weekB : weekA;
    return (
      <div
        key={u.id}
        className="bg-white shadow rounded-[20px] p-4 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold">#{i + 1}</span>

          <img
            src={u.avatar}
            className="w-10 h-10 rounded-full object-cover"
          />

          <div>
            <p className="font-medium capitalize">{u.name}</p>

            {/* 🔥 WEEK SCORING (NEW) */}
            {/* <div className="flex gap-1 text-[11px] text-gray-500 mt-1">
             

                {weekA.map((d, idx) => (
    <td
      key={"w1-" + idx}
      className={`p-3 bg-gray-100 px-1.5 py-[2px] rounded ${idx === 4 ? "" : ""}`}
    >
      {d}
    </td>
  ))}
            </div> */}
          </div>
        </div>

        {/* SCORE */}
        <div className="flex items-center gap-2 font-bold text-[#fab31e]">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2933/2933116.png"
            className="w-4 h-4"
          />
          {u.score || 0}
        </div>
      </div>
    );
  })}
</div>
    </div>
  );
}
