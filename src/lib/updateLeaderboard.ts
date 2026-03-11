import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  increment,
  query,
  where,
  getDoc,
  setDoc
} from "firebase/firestore";
import { calculateScore } from "./calculateScore";

export async function updateLeaderboard(answers: any, userId?: string) {

  const votesSnap = userId
    ? await getDocs(query(collection(db, "votes"), where("userId", "==", userId)))
    : await getDocs(collection(db, "votes"));

  const votesByUser: any = {};

  votesSnap.docs.forEach((v) => {
    const data = v.data();

    if (!votesByUser[data.userId]) {
      votesByUser[data.userId] = {};
    }

    votesByUser[data.userId][data.questionId] = data.answer;
  });

  const users = userId ? [userId] : Object.keys(votesByUser);

  for (const uid of users) {

    if (!votesByUser[uid]) continue;

    const userVotes = votesByUser[uid];

    const score = calculateScore(userVotes, answers);

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    // 🔥 THIS FIXES YOUR ERROR
    if (!userSnap.exists()) {

      await setDoc(userRef, {
        score: score
      });

    } else {

      await updateDoc(userRef, {
        score: increment(score)
      });

    }
  }
}