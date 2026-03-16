"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "./Button";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Menu, X } from 'lucide-react';

export default function DesktopNav() {
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
  const [isCurator, setIsCurator] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const today = new Date().toISOString().split("T")[0];

  
useEffect(() => {

  const checkCurator = async (uid: string) => {
    // get LOCAL today string
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const sixPM = 18 * 60;
    let activeDate: string | null = null;

    if (currentMinutes < sixPM) {
      activeDate = today;
    }

    if (currentMinutes >= sixPM) {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      const ty = t.getFullYear();
      const tm = String(t.getMonth() + 1).padStart(2, "0");
      const td = String(t.getDate()).padStart(2, "0");
      activeDate = `${ty}-${tm}-${td}`;
    }

    if (!activeDate) {
      setIsCurator(false);
    } else {
      const curatorSnap = await getDoc(doc(db, "dailyCurator", activeDate));
      if (curatorSnap.exists() && curatorSnap.data().curatorId === uid) {
        setIsCurator(true);
      } else {
        setIsCurator(false);
      }
    }
  };

  const loadPinUser = async () => {
    const pinUser = localStorage.getItem("pinUser");

    if (pinUser) {
      const parsed = JSON.parse(pinUser);
      setUser({ uid: parsed.uid });
      setRole(parsed.role || "user");
      await checkCurator(parsed.uid);
    }
  };

  // restore pin login
  loadPinUser();

  window.addEventListener("pin-login", loadPinUser);

  const unsub = auth.onAuthStateChanged(async (u) => {
    if (!u) {
      loadPinUser();
      return;
    }

    const userSnap = await getDoc(doc(db, "users", u.uid));

    if (userSnap.exists()) {
      setUser(u);
      setRole(userSnap.data().role || "");
      await checkCurator(u.uid);
    }
  });

  return () => {
    unsub();
    window.removeEventListener("pin-login", loadPinUser);
  };

}, []);


const logout = async () => {

  localStorage.removeItem("pinUser");

  try {
    await signOut(auth);
  } catch {}

  window.location.href = "/";
};

  return (
    <div className=" container">
      <header className=" w-full flex justify-center py-5 px-6 relative z-[50]">
        <div className="h-[90px] flex items-center bg-[rgba(142,142,142,0.20)] rounded-[20px] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] absolute inset-x-0 z-[50]">
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

          {/* DESKTOP LINKS */}

          <div className="hidden md:flex items-center gap-6 ml-auto px-6">
            {user && (
              <>
                <Link href="/" className="font-medium">
                  Home
                </Link>

                <Link href="/leaderboard" className="font-medium">
                  Leaderboard
                </Link>
              </>
            )}

            {role === "admin" && (
              <Link href="/admin" className="font-medium">
                Admin
              </Link>
            )}

           {(isCurator || role === "admin") && (
  <Link href="/curator" className="font-medium">
    Curator
  </Link>
)}

            {user ? (
              <Button onClick={logout} text="Logout" className="text-black" />
            ) : (
              <Button
                href="/login"
                text="Login / Signup"
                className="text-black"
              />
            )}
          </div>

          {/* MOBILE HAMBURGER */}

         

 <div className="md:hidden ml-auto px-5">
  <button  onClick={() => setMenuOpen(!menuOpen)}>
    {menuOpen ? (
      <X className="w-8 h-8 text-black" />
    ) : (
      <Menu className="w-8 h-8 text-black" />
    )}
  </button>
</div>
        </div>

        {/* MOBILE MENU */}

        {menuOpen && (
          <div className=" md:hidden fixed inset-0 bg-white  container z-[100] flex flex-col gap-8 text-xl">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 text-2xl"
            >
              ✕
            </button>
            {/* MENU LINKS */}
            <div className="flex flex-col gap-6 text-lg font-medium pt-24">
              {user && (
                <>
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="text-lg font-medium"
                  >
                    Home
                  </Link>

                  <Link
                    href="/leaderboard"
                    onClick={() => setMenuOpen(false)}
                    className="text-lg font-medium"
                  >
                    Leaderboard
                  </Link>
                </>
              )}

              {role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-medium"
                >
                  Admin
                </Link>
              )}

              {isCurator && (
                <Link
                  href="/curator"
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-medium"
                >
                  Curator
                </Link>
              )}

              {user ? (
                <Button onClick={logout} text="Logout" className="text-black" />
              ) : (
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
