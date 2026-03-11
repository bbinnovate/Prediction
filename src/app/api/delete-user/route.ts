import { NextResponse } from "next/server";
import { adminAuth, adminDB } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {

    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    // try deleting auth user
    try {
      await adminAuth.deleteUser(uid);
    } catch (err: any) {

      // ignore if user does not exist
      if (err.code !== "auth/user-not-found") {
        throw err;
      }

    }

    // always delete firestore user
    await adminDB.collection("users").doc(uid).delete();

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}