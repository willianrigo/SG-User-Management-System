"use client";
import { useEffect, useState } from "react";
import { ref, onValue, off, type DataSnapshot } from "firebase/database";
import { getRTDB } from "@/shared/firebase/init";
import type { IUser } from "../types";

export function useUser(userId: string) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const db = getRTDB();
    const userRef = ref(db, `/users/${userId}`);

    const unsubscribe = onValue(
      userRef,
      (snapshot: DataSnapshot) => {
        setUser(snapshot.val());
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      off(userRef);
    };
  }, [userId]);

  return { user, loading, error };
}
