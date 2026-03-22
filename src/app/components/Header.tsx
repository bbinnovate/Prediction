"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "./Button";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";
import { ChevronDown, Menu, X } from "lucide-react";

export default function DesktopNav() {
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
  const [isCurator, setIsCurator] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // 🔥 LOAD USER + ROLE + CURATOR
  useEffect(() => {
const checkCurator = async (uid: string) => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const today = `${year}-${month}-${day}`;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const sixPM = 18 * 60;

  let activeDate;

  if (currentMinutes < sixPM) {
    activeDate = today;
  } else {
    const t = new Date();
    t.setDate(t.getDate() + 1);

    const ty = t.getFullYear();
    const tm = String(t.getMonth() + 1).padStart(2, "0");
    const td = String(t.getDate()).padStart(2, "0");

    activeDate = `${ty}-${tm}-${td}`;
  }

  console.log("CHECKING DATE:", activeDate); // 🔥 debug

  const curatorSnap = await getDoc(doc(db, "dailyCurator", activeDate));

  console.log("CURATOR DATA:", curatorSnap.data()); // 🔥 debug

  if (curatorSnap.exists() && curatorSnap.data()?.curatorId === uid) {
    setIsCurator(true);
  } else {
    setIsCurator(false);
  }
};



const loadPinUser = async () => {
  const pinUser = localStorage.getItem("pinUser");

  if (pinUser) {
    const parsed = JSON.parse(pinUser);
    setUser({ uid: parsed.uid });
    setRole(parsed.role || "user");

    const snap = await getDoc(doc(db, "users", parsed.uid));
    if (snap.exists()) setUserData(snap.data());

    await checkCurator(parsed.uid);
  }

  setAuthLoading(false); // ✅ important
};

    loadPinUser();
    window.addEventListener("pin-login", loadPinUser);

    const unsub = auth.onAuthStateChanged(async (u) => {
  if (!u) {
    setAuthLoading(false);
    return;
  }

  const snap = await getDoc(doc(db, "users", u.uid));

  if (snap.exists()) {
    setUser(u);
    setRole(snap.data().role || "");
    setUserData(snap.data());
    await checkCurator(u.uid);
  }

  setAuthLoading(false); // ✅ THIS FIXES YOUR ISSUE
});

   return () => {
  unsub();
  window.removeEventListener("pin-login", loadPinUser);
};
  }, []);

  // 🔥 GET RANK
  useEffect(() => {
    const fetchRank = async () => {
      if (!user?.uid) return;

      const snap = await getDocs(query(collection(db, "users"), orderBy("score", "desc")));

      let index = 0;
      snap.docs.forEach((d, i) => {
        if (d.id === user.uid) index = i + 1;
      });

      setRank(index);
    };

    fetchRank();
  }, [user]);

  const logout = async () => {
    localStorage.removeItem("pinUser");
    try {
      await signOut(auth);
    } catch {}
    window.location.href = "/";
  };

  return (
    <div className="container">
      <header className="w-full flex justify-center py-5 px-6 relative z-[50]">
        <div className="h-[90px] flex items-center bg-[rgba(142,142,142,0.20)] rounded-[20px] backdrop-blur-md shadow absolute inset-x-0 z-[50]">

          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/bblogo.webp"
              alt="Logo"
              width={250}
              height={80}
              className="object-contain px-6"
              priority
            />
          </Link>

          

          {/* DESKTOP */}
          <div className="hidden md:flex items-center gap-6 ml-auto px-6">
{user && (
  <>
    <Link href="/" className="font-medium">BB A.L.L</Link>

    <Link href="/leaderboard" className="font-medium">
      Leaderboard
    </Link>
  </>
)}
       {!authLoading && user ? (
              <div className="relative group">

<div className="flex items-center gap-3 cursor-pointer">
  <img
    src={
      userData?.photo ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }
    className="w-10 h-10 rounded-full object-cover"
  />

  <div className="text-left">
    <p className="font-medium capitalize">
      {userData?.name || "User"}
    </p>
    <p className="text-xs text-[#fab31e] flex items-center gap-1">
  {rank === 1 && <span>👑</span>}
  Rank #{rank || "-"}
</p>
  </div>

  {/* 👇 Dropdown indicator */}
 <ChevronDown className="w-4 h-4 text-black group-hover:rotate-180 transition" />
</div>

                {/* DROPDOWN */}
               
<div className="absolute right-0 top-full w-56 bg-white shadow-lg rounded-[20px] p-3 flex flex-col gap-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">                    <Link href="/all-questions" className="hover:bg-gray-100 p-2 rounded">
                      All Question
                    </Link>

                    <Link href="/profile" className="hover:bg-gray-100 p-2 rounded">
                      My Profile
                    </Link>

                    {role === "admin" && (
                      <Link href="/admin" className="hover:bg-gray-100 p-2 rounded">
                        Admin
                      </Link>
                    )}

                    {(isCurator || role === "admin") && (
                      <Link href="/curator" className="hover:bg-gray-100 p-2 rounded">
                        Curator
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="text-left hover:bg-gray-100 p-2 rounded text-red-500 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
               
              </div>
            ) : (
              <Button
                href="/login"
                text="Login / Signup"
                className="text-black"
              />
            )}
          </div>

          {/* MOBILE */}
          <div className="md:hidden ml-auto px-5">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? (
                <X className="w-8 h-8 text-black" />
              ) : (
                <Menu className="w-8 h-8 text-black" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU (unchanged) */}
{menuOpen && (
  <div className="md:hidden fixed inset-0 bg-white container z-[100] flex flex-col gap-8 text-xl">
    <button
      onClick={() => setMenuOpen(false)}
      className="absolute top-6 right-6 text-2xl"
    >
      ✕
    </button>

    <div className="flex flex-col gap-6 text-lg font-medium pt-24">

      {/* ✅ USER INFO (ONLY WHEN LOGGED IN) */}
      {!authLoading && user && (
        <div className="flex items-center gap-3 px-2">
          <img
            src={
              userData?.photo ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="w-12 h-12 rounded-full object-cover"
          />

          <div>
            <p className="font-semibold capitalize">
              {userData?.name || "User"}
            </p>
            <p className="text-sm text-[#fab31e]">
             {rank === 1 && <span>👑</span>}
  Rank #{rank || "-"}
            </p>
          </div>
        </div>
      )}

      {/* ✅ SHOW LINKS ONLY WHEN USER EXISTS */}
      {!authLoading && user && (
        <>
          <Link href="/" onClick={() => setMenuOpen(false)}>BB A.L.L</Link>
          <Link href="/leaderboard" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
          <Link href="/all-questions" onClick={() => setMenuOpen(false)}>All Question</Link>
          <Link href="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>

          {role === "admin" && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>
          )}

          {(isCurator || role === "admin") && (
            <Link href="/curator" onClick={() => setMenuOpen(false)}>Curator</Link>
          )}

          <Button onClick={logout} text="Logout" className="text-black" />
        </>
      )}

      {/* ✅ SHOW LOGIN ONLY WHEN NOT LOGGED IN */}
      {!authLoading && !user && (
        <Button
          href="/login"
          text="Login / Signup"
          className="text-black"
          onClick={() => setMenuOpen(false)}
        />
      )}

    </div>
  </div>
)}
      </header>
    </div>
  );
}