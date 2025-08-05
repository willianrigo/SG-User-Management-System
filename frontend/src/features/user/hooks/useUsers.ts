"use client";
import { useEffect, useState } from "react";
import { ref, onValue, off, remove, type DataSnapshot } from "firebase/database";
import { getRTDB } from "@/shared/firebase/init";
import type { IUser } from "../types";

export function useUsers() {
  const [users, setUsers] = useState<Record<string, IUser>>({});
  const [usersList, setUsersList] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getRTDB();
    const usersRef = ref(db, '/users');

    const unsubscribe = onValue(
      usersRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val() || {};
        setUsers(data);
        
        // Convert to array for easier rendering
        const usersArray = Object.entries(data).map(([id, user]) => ({
          ...user as IUser,
          id,
        }));
        setUsersList(usersArray);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      off(usersRef);
    };
  }, []);

  const deleteUser = async (userId: string) => {
    try {
      const db = getRTDB();
      const userRef = ref(db, `/users/${userId}`);
      await remove(userRef);
      return true;
    } catch (err) {
      console.error('Failed to delete user:', err);
      return false;
    }
  };

  return { 
    users, 
    usersList, 
    loading, 
    error, 
    deleteUser 
  };
}
