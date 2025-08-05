"use client";
import { useEffect, useState } from "react";
import { ref, onValue, off, type DataSnapshot } from "firebase/database";
import { getRTDB } from "@/shared/firebase/init";
import type { IRequestStatus } from "../types";

export function useRequestStatus(userId: string, requestId: string) {
  const [status, setStatus] = useState<IRequestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !requestId) return;
    const db = getRTDB();
    const reqRef = ref(db, `/requests/${requestId}`);

    const unsubscribe = onValue(
      reqRef,
      (snapshot: DataSnapshot) => {
        setStatus(snapshot.val());
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      off(reqRef);
    };
  }, [userId, requestId]);

  return { status, loading, error };
}
