"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc ,serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { setCookie } from "cookies-next";
import Button from "../components/Button";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
} from "firebase/firestore";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (nameError || emailError || pinError || pin.length !== 4) {
      setLoading(false);
      return;
    }
  const pinDoc = await getDoc(doc(db,"pinLogin",pin));

if(pinDoc.exists()){
 alert("PIN already used");
 setLoading(false);
 return;
}

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const user = res.user;

      await setDoc(doc(db, "users", user.uid), {
  name,
  email,
  pin,
  role: "user",
  score: 0,
  createdAt: serverTimestamp()
});

// create PIN login mapping
await setDoc(doc(db, "pinLogin", pin), {
  uid: user.uid
});
localStorage.setItem(
  "pinUser",
  JSON.stringify({
    uid: user.uid,
    role: "user",
    name: name
  })
);

window.dispatchEvent(new Event("pin-login"));
      const token = await user.getIdToken();

      setCookie("firebase-auth", token, {
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      alert("Signup successful! Welcome!");

      router.push("/");
    } catch (err: any) {
      console.error(err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError("❌ Email already registered");
          break;

        case "auth/weak-password":
          setError("❌ Password must be at least 6 characters");
          break;

        case "auth/invalid-email":
          setError("❌ Invalid email format");
          break;

        default:
          setError("❌ Signup failed. Please try again");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleNameChange(value: string) {
    if (!/^[A-Za-z\s]*$/.test(value)) {
      setNameError(" Name can contain only letters");
      return;
    }

    setNameError("");
    setName(value);
  }

  function handleEmailChange(value: string) {
    if (!/^[A-Za-z0-9@.]*$/.test(value)) {
      setEmailError(" Only letters, numbers, @ and . allowed");
      return;
    }

    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError(" Enter a valid email address");
    } else {
      setEmailError("");
    }

    setEmail(value);
  }

  function handlePinChange(value: string) {

  if (!/^\d*$/.test(value)) {
    setPinError("PIN must contain only numbers");
    return;
  }

  if (value.length > 4) return;

  setPin(value);

  if (value.length !== 4) {
    setPinError("PIN must be exactly 4 digits");
  } else {
    setPinError("");
  }
}

  return (
    <div className=" container lg:py-20 md:py-15 py-10 flex items-center justify-center min-h-screen">
      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSignup}
          className="relative bg-black p-10 shadow-md w-96 space-y-4 overflow-hidden rounded-[20px]"
        >
          <div className="absolute -right-1 top-0 w-2 sm:w-2 md:w-5 h-full bg-[#FAB31E]" />

          <h2 className="text-xl font-semibold text-white text-center">
            Signup
          </h2>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Full Name"
            required
            className="w-full border p-2 rounded text-white bg-black"
          />

          {nameError && <p className="text-red-500 text-xs">{nameError}</p>}

          <input
            type="text"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="Email"
            required
            className="w-full border p-2 rounded text-white bg-black"
          />

          {emailError && <p className="text-red-500 text-xs">{emailError}</p>}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full border p-2 rounded text-white bg-black pr-12"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-80 hover:opacity-100 transition cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <input
  type="text"
  value={pin}
  onChange={(e) => handlePinChange(e.target.value)}
  placeholder="4 Digit Login PIN"
  required
  maxLength={4}
  className="w-full border p-2 rounded text-white bg-black"
/>

{pinError && <p className="text-red-500 text-xs">{pinError}</p>}

          <Button
            type="submit"
            disabled={loading || !!nameError || !!emailError}
            className="white-text"
            text={loading ? "Creating account..." : "Sign Up"}
          />

          <p className="text-center text-white text-sm mt-2">
            Already have an account?{" "}
            <a href="/login" className="text-[#FAB31E] underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
