import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    const { date } = await req.json();

    if (!date) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }

    console.log("🔥 Running scoring for:", date);

    // ✅ GET QUESTIONS
    const qSnap = await adminDB
      .collection("questions")
      .where("date", "==", date)
      .get();

    if (qSnap.empty) {
      return NextResponse.json({ error: "No questions found" });
    }

    const correctMap: any = {};

    qSnap.forEach((doc) => {
      const data = doc.data();
      if (data.correctAnswer) {
        correctMap[doc.id] = String(data.correctAnswer)
          .trim()
          .toLowerCase();
      }
    });

    // ✅ GET VOTES
    const votesSnap = await adminDB
      .collection("votes")
      .where("date", "==", date)
      .get();

    if (votesSnap.empty) {
      return NextResponse.json({ error: "No votes found" });
    }

    const userScores: any = {};
    const allUsersSet = new Set<string>();

    votesSnap.forEach((doc) => {
      const data = doc.data();

      if (!data.userId) {
        console.log("❌ Missing userId:", data);
        return;
      }

      allUsersSet.add(data.userId);

      const correct = correctMap[data.questionId];

      if (!correct) {
        console.log("❌ Question mismatch:", data.questionId);
        return;
      }

      const userAnswer = String(data.answer).trim().toLowerCase();

      if (userAnswer === correct) {
        userScores[data.userId] =
          (userScores[data.userId] || 0) + 1;
      } else {
        console.log("❌ Wrong answer:", {
          user: data.userId,
          answer: data.answer,
          correct,
        });
      }
    });

    // ✅ IMPORTANT: INCLUDE USERS WITH 0 SCORE
    allUsersSet.forEach((uid) => {
      if (!userScores[uid]) {
        userScores[uid] = 0;
      }
    });

    console.log("🏆 Final Scores:", userScores);

    const batch = adminDB.batch();
    const dayIndex = new Date().getDay(); // 0–6

    // ✅ UPDATE USERS
    for (const uid of Object.keys(userScores)) {
      const ref = adminDB.collection("users").doc(uid);
      const snap = await ref.get();

      let weekly = ["0/4", "0/4", "0/4", "0/4", "0/4"];

      if (snap.exists) {
        const data = snap.data();
        if (data?.weekly) {
          weekly = data.weekly;
        }
      }

      // 🔁 Reset Saturday
      if (dayIndex === 6) {
        weekly = ["0/4", "0/4", "0/4", "0/4", "0/4"];
      }

      // 📅 Monday–Friday
      if (dayIndex >= 1 && dayIndex <= 5) {
        weekly[dayIndex - 1] = `${userScores[uid]}/4`;
      }

      batch.set(
        ref,
        {
          score: admin.firestore.FieldValue.increment(userScores[uid]),
          weekly: weekly,
          lastPlayed: date, // keep consistency
        },
        { merge: true }
      );
    }

    await batch.commit();

    console.log("✅ Scores + weekly updated");

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ API ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}