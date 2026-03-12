"use client";

import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { query, orderBy } from "firebase/firestore";
import { ChevronDown } from "lucide-react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { deleteDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";
import Button from "./Button";
type User = {
  id: string
  name?: string
  email?: string
  role?: string
  score?: number
  pin?: string
  createdAt?: any
}
export default function Admin() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [assigning, setAssigning] = useState(false);


  /* ---------------- AUTH + LOAD USERS ---------------- */

useEffect(() => {
  const unsub = auth.onAuthStateChanged(async (user) => {

    let uid = user?.uid;

    // if firebase user not found → check PIN session
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

    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {
      router.push("/login");
      return;
    }

    if (snap.data().role !== "admin") {
      router.push("/");
      return;
    }

    /* LOAD USERS */

const q = query(collection(db, "users"), orderBy("score", "desc"));

const usersSnap = await getDocs(q);

const loadedUsers: User[] = usersSnap.docs.map(d => ({
  id: d.id,
  ...(d.data() as Omit<User, "id">)
}));


setUsers(loadedUsers.filter(u => u.name && u.email));
    /* LOAD ASSIGNMENTS */

    const curatorsSnap = await getDocs(collection(db, "dailyCurator"));

    setEvents(
      curatorsSnap.docs.map((d) => ({
        id: d.id,
        title: d.data().name || "Curator",
        date: d.id,
        backgroundColor: "#fab31e",
        borderColor: "#fab31e",
        textColor: "black",
      })),
    );

  });

  return () => unsub();
}, []);

  /* ---------------- DATE CLICK ---------------- */

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
  };

  /* ---------------- ASSIGN CURATOR ---------------- */

  const assignCurator = async (userId: string) => {
    const user = users.find((u) => u.id === userId);

    if (!user || !selectedDate) return;

    try {
      setAssigning(true);
      // Immediately save to firestore
      await setDoc(doc(db, "dailyCurator", selectedDate), {
        curatorId: user.id,
        name: user.name,
        email: user.email,
      });

      // Update UI immediately
      setEvents((prev) => {
        const filtered = prev.filter((e) => e.date !== selectedDate);

        return [
          ...filtered,
          {
            id: selectedDate,
            title: user.name,
            date: selectedDate,
            backgroundColor: "#fab31e",
            borderColor: "#fab31e",
            textColor: "black",
          },
        ];
      });

      // Show success message
      setAssignSuccess(true);
      
      // Send email in the background so it doesn't lag the UI
      fetch("/api/send-curator-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
           assignDate: selectedDate,
        }),
      }).catch(err => console.error("Email send failed (silent):", err));

      setTimeout(() => {
        setAssignSuccess(false);
        setAssigning(false);
        setSelectedDate("");
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Failed");
      setAssigning(false);
    }
  };
  /* ---------------- DELETE USER ---------------- */

  const handleDelete = async (id: string) => {
    if (!confirm("Delete user?")) return;

    await fetch("/api/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: id }),
    });

    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

const removeAssignment = async (eventInfo: any) => {

  const date = eventInfo.event.startStr;

  if (!confirm(`Remove curator from ${date}?`)) return;

  try {

    // delete from firestore
    await deleteDoc(doc(db, "dailyCurator", date));

    // remove from UI state
    setEvents((prev) => prev.filter((e) => e.id !== date));

    // remove from calendar instance
    eventInfo.event.remove();

  } catch (err) {
    console.error("DELETE ERROR:", err);
    alert("Failed to remove curator");
  }

};
  /* ---------------- UI ---------------- */
  const renderEventContent = (eventInfo: any) => {
    return (
      <div className="flex justify-between items-center px-1">
        <span className="truncate text-sm font-medium capitalize">
          {eventInfo.event.title}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeAssignment(eventInfo);
          }}
          className="ml-2 text-black cursor-pointer font-bold"
        >
          ✕
        </button>
      </div>
    );
  };


  const resetAllScores = async () => {
  if (!confirm("Reset ALL user scores to 0?")) return;

  try {
    const snap = await getDocs(collection(db, "users"));

    const promises = snap.docs.map((d) =>
      setDoc(doc(db, "users", d.id), { score: 0 }, { merge: true })
    );

    await Promise.all(promises);

    // update UI immediately
    setUsers((prev) => prev.map((u) => ({ ...u, score: 0 })));

    alert("All scores reset to 0");
  } catch (err) {
    console.error("RESET ERROR:", err);
    alert("Failed to reset scores");
  }
};

  return (
    <div className=" container w-full min-h-screen p-10">
      {/* <h1 className="text-3xl font-semibold mb-8 lg:mt-40">Curator Calendar</h1> */}

      {/* ---------------- CALENDAR ---------------- */}

      <div className="bg-white rounded-xl shadow p-6 mb-12 lg:mt-20 mt-20">
       <FullCalendar
  plugins={[dayGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"

  weekends={false}            // 🔥 hides Saturday & Sunday
  height="auto"               // 🔥 better for mobile

  events={events}
  dateClick={handleDateClick}
  eventContent={renderEventContent}

  dayMaxEventRows={2}         // 🔥 prevents overflow on mobile
  expandRows={true}           // 🔥 better spacing on small screens
/>
      </div>

      {/* ---------------- POPUP ---------------- */}

    {selectedDate && (
  <div 
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={(e) => {
      if (e.target === e.currentTarget && !assigning) setSelectedDate("");
    }}
  >

<div className="bg-white rounded-xl shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">

{assignSuccess ? (
  <div className="flex flex-col items-center justify-center py-10">
   <div className="w-16 h-16 bg-[#fab31e] text-black rounded-full flex items-center justify-center mb-4">
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
</div>
    <h4 className="font-semibold text-xl">Curator Assigned!</h4>
  </div>
) : (
  <>
    <h4 className=" font-semibold mb-4">
      Assign Curator for {new Date(selectedDate).toLocaleDateString("en-GB")}
    </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">

        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => assignCurator(user.id)}
            disabled={assigning}
            className="border rounded-lg px-3 py-2 hover:bg-[#fab31e] disabled:opacity-50 transition text-sm capitalize cursor-pointer"
          >
            {user.name}
          </button>
        ))}

      </div>

      <Button 
        onClick={() => setSelectedDate("")}
        disabled={assigning}
        className=" mt-6 black-text"
        text="CANCEL"
      />
  </>
)}

</div>

  </div>
)}


      {/* {selectedDate && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-[360px]">


  <h4 className="text-lg font-semibold mb-4">Assign Curator</h4>

  <p className="text-sm mb-4">
    Date: <b>{selectedDate}</b>
  </p>

  <div className="relative mb-4">
    <select
      value={selectedUser}
      onChange={(e) => setSelectedUser(e.target.value)}
      className="border w-full p-2 rounded appearance-none"
    >
      <option value="">Select curator</option>

      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name} ({u.score} pts)
        </option>
      ))}
    </select>

    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" />
  </div>

  <div className="flex gap-3">

    <button
      onClick={assignCurator}
      className="flex-1 bg-black text-white py-2 rounded"
    >
      Assign
    </button>

    <button
      onClick={() => {
        setSelectedDate("")
        setSelectedUser("")
      }}
      className="flex-1 border py-2 rounded hover:bg-gray-100"
    >
      Cancel
    </button>

  </div>

</div>


  </div>
)} */}

      {/* ---------------- USER TABLE ---------------- */}
      <div className="flex justify-end mb-4">
  <button
    onClick={resetAllScores}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    Reset All Scores
  </button>
</div>

      <div className="overflow-x-auto border rounded-[20px] shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3 text-left">Rank</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Date Joined</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Score</th>
              <th className="px-6 py-3 text-left">PIN</th>
              {/* <th className="px-6 py-3 text-left">Curator Assign</th> */}
              <th className="px-6 py-3 text-right">Delete</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.map((user, index) => {
              let joinedDate = "—";

              if (user.createdAt) {
                if (typeof user.createdAt === "string") {
                  joinedDate = new Date(user.createdAt).toLocaleDateString(
                    "en-GB",
                  );
                } else if ("seconds" in user.createdAt) {
                  joinedDate = new Date(
                    user.createdAt.seconds * 1000,
                  ).toLocaleDateString("en-GB");
                }
              }

              const handleRoleChange = async (id: string, role: string) => {
                await setDoc(doc(db, "users", id), { role }, { merge: true });

                setUsers((prev) =>
                  prev.map((u) => (u.id === id ? { ...u, role } : u)),
                );
              };

              const handleDelete = async (id: string) => {
                if (!confirm("Delete this user?")) return;

                try {
                  const res = await fetch("/api/delete-user", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ uid: id }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    alert(data.error || "Delete failed");
                    return;
                  }

                  setUsers((prev) => prev.filter((u) => u.id !== id));
                } catch (err) {
                  console.error("DELETE USER ERROR:", err);
                  alert("Server error deleting user");
                }
              };

              return (
                <tr key={user.id}>
                  <td className="px-6 py-3">{index + 1}</td>
                  <td className="px-6 py-3 font-semibold">#{index + 1}</td>
                  <td className="px-6 py-3 capitalize">{user.name || "—"}</td>
                  <td className="px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3">{joinedDate}</td>

                  <td className="px-6 py-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="border rounded px-2 py-1 capitalize"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>


                  <td className="p-4 font-bold text-[#fab31e]">
<div className="flex items-center gap-2 text-[#fab31e] font-bold">
  <img
    src="https://cdn-icons-png.flaticon.com/512/2933/2933116.png"
    className="w-4 h-4"
  />
  {user.score || 0}
</div>
</td>
                  <td className="px-6 py-3">
                    <UserPinDisplay pin={user.pin} />
                  </td>
                  
                  
                  {/* 
                  <td className="px-6 py-3">
  {(() => {
    const status = getStatus(user.id);
    return <span className={status.className}>{status.label}</span>;
  })()}
</td> */}

                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserPinDisplay({ pin }: { pin?: string }) {
  const [show, setShow] = useState(false);

  if (!pin) return <span className="text-gray-400 italic">Not set</span>;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono tracking-widest text-lg w-12">
        {show ? pin : "••••"}
      </span>
      <button
        onClick={() => setShow(!show)}
        className="text-gray-500 hover:text-black transition p-1 cursor-pointer"
        title={show ? "Hide PIN" : "Show PIN"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function UserPin({ pin }: { pin?: string }) {
  const [show, setShow] = useState(false);

  if (!pin) return <span className="text-gray-400 italic">Not set</span>;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono tracking-widest text-lg w-12">
        {show ? pin : "••••"}
      </span>
      <button
        onClick={() => setShow(!show)}
        className="text-gray-500 hover:text-black transition p-1 cursor-pointer"
        title={show ? "Hide PIN" : "Show PIN"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
