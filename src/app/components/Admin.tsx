"use client";

import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import { query, orderBy } from "firebase/firestore";

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const router = useRouter();
 
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // get user role
      const snap = await getDoc(doc(db, "users", user.uid));

if (!snap.exists()) {
  await auth.signOut();
  router.push("/login");
  return;
}

if (snap.data().role !== "admin") {
  router.push("/");
  return;
}

      // load users only if admin
      const q = query(collection(db, "users"), orderBy("score", "desc"));
const usersSnap = await getDocs(q);

setUsers(
  usersSnap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    score: Number(d.data().score) || 0
  }))
);

    });

    return () => unsub();
  }, []);

const assign = async () => {

  if (!selected) {
    alert("Select user")
    return
  }

  try {

    const date = new Date().toISOString().split("T")[0]

    await setDoc(doc(db, "dailyCurator", date), {
      curatorId: selected,
    })

    const user = users.find((u) => u.id === selected)

    await fetch("/api/send-curator-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
      }),
    })

    alert("✅ Task assigned & email sent")

  } catch (err) {

    console.error(err)
    alert("❌ Failed to assign curator")

  }
}

  

  return (
    <div className="container min-h-[calc(100vh-160px)] lg:pt-40 pt-30 lg:py-20 md:py-15 py-10">
      <h1 className="text-2xl mb-6 font-semibold">Assign Curator</h1>

      <div className="flex gap-4 mb-10">
        <select
          onChange={(e) => setSelected(e.target.value)}
          className="border px-4 py-2 rounded"
        >
          <option value="">Select user</option>

          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <button
          onClick={assign}
          className="bg-yellow-400 px-6 py-2 rounded font-medium"
        >
          Assign
        </button>
      </div>

      {/* USER TABLE */}

      <div className="overflow-x-auto border rounded-lg shadow">
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

                    <td className="px-6 py-3 font-semibold">
                      {user.score || 0}
                    </td>

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
