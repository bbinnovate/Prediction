"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import Button from "../components/Button";
import { Eye, EyeOff } from "lucide-react";
import { deleteDoc } from "firebase/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [photo, setPhoto] = useState("");
  const [score, setScore] = useState(0);
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      let uid: any = null;

      const firebaseUser = auth.currentUser;
      if (firebaseUser) uid = firebaseUser.uid;

      const pinUser = localStorage.getItem("pinUser");
      if (!uid && pinUser) {
        uid = JSON.parse(pinUser).uid;
      }

      if (!uid) return;

      const snap = await getDoc(doc(db, "users", uid));

      if (snap.exists()) {
        const data = snap.data();

        setUser(uid);
        setName(data.name || "");
        setEmail(data.email || "");
        setPin(data.pin || "");
        setPhoto(data.photo || "");
        setScore(data.score || 0);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const updateProfile = async () => {
    if (!user) return;

    if (pin.length !== 4) {
      alert("PIN must be 4 digits");
      return;
    }

    setSaving(true);

    try {
      const userRef = doc(db, "users", user);
      const snap = await getDoc(userRef);

      const oldPin = snap.data()?.pin;

      // PIN changed
      if (oldPin !== pin) {
        const pinDoc = await getDoc(doc(db, "pinLogin", pin));

        if (pinDoc.exists()) {
          const pinData = pinDoc.data();

          // PIN belongs to someone else
          if (pinData?.uid !== user) {
            alert("This PIN is already used by another user");
            setSaving(false);
            return;
          }
        }

        // delete old PIN mapping
        if (oldPin) {
          await deleteDoc(doc(db, "pinLogin", oldPin));
        }

        // create new mapping
        await setDoc(doc(db, "pinLogin", pin), {
          uid: user,
        });
      }

      await updateDoc(userRef, {
        name,
        email,
        pin,
        photo,
      });

      alert("Profile Updated");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }

    setSaving(false);
  };

  const uploadImage = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const imageRef = ref(
        storage,
        `avatars/${user}/${Date.now()}-${file.name}`
      );

      await uploadBytes(imageRef, file);

      const url = await getDownloadURL(imageRef);

      await updateDoc(doc(db, "users", user), {
        photo: url,
      });

      setPhoto(url + "?v=" + Date.now());
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen container flex items-center justify-center py-20">
      <div className="bg-black w-[420px] rounded-[20px] p-8 relative overflow-hidden">
        <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-5 h-full bg-[#FAB31E]"></div>

        <h3 className="text-white font-semibold text-center mb-6">
          Your Profile
        </h3>

        <div className="flex flex-col items-center ">
          <img
            key={photo}
            src={
              photo && photo.trim() !== ""
                ? photo
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="w-24 h-24 rounded-full object-cover border-4 border-[#FAB31E]"
          />

          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
             className="w-full border p-2 rounded bg-black text-white mb-3 mt-8"
          />
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full border p-2 rounded bg-black text-white mb-3"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border p-2 rounded bg-black text-white mb-3"
        />

        <div className="relative mb-3">
          <input
            type={showPin ? "text" : "password"}
            value={pin}
            maxLength={4}
            onChange={(e) => setPin(e.target.value)}
            placeholder="4 Digit PIN"
            className="w-full border p-2 rounded bg-black text-white pr-10"
          />

          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white cursor-pointer"
          >
            {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="bg-[#1D1D1D] p-3 rounded text-center mb-5">
          <p className="text-gray-400 text-sm">Your Score</p>
          <p className="text-[#FAB31E] text-2xl font-bold">{score}</p>
        </div>

        <Button
          text={saving ? "Saving..." : "Update Profile"}
          onClick={updateProfile}
          className="white-text w-full"
        />
      </div>
    </div>
  );
}