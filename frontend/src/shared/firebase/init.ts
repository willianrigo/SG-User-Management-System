// src/shared/firebase/init.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator, type Database } from "firebase/database";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";

let app: FirebaseApp | null = null;
let db: Database | null = null;
let auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (typeof window === "undefined") {
      throw new Error("Firebase client SDK should only be initialized in the browser.");
    }
    
    // Use emulator config for development
    if (process.env.NODE_ENV === 'development') {
      app = initializeApp({
        apiKey: "demo-api-key", // Dummy API key for emulator
        authDomain: "user-management-south-geeks.firebaseapp.com",
        projectId: "user-management-south-geeks", // Use same project as backend
        databaseURL: "http://localhost:9000?ns=user-management-south-geeks-default-rtdb", // Emulator URL
      });
    } else {
      // Production configuration
      app = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
      });
    }
  }
  return app;
}

let isEmulatorConnected = false;

export function getRTDB() {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    db = getDatabase(firebaseApp);
    
    // Connect to emulator in development (only once)
    if (process.env.NODE_ENV === 'development' && !isEmulatorConnected) {
      try {
        connectDatabaseEmulator(db, 'localhost', 9000);
        isEmulatorConnected = true;
      } catch (error) {
        // Emulator might already be connected, ignore error
        console.log('Firebase emulator connection info:', error);
      }
    }
  }
  return db;
}

let isAuthEmulatorConnected = false;

export function getFirebaseAuth() {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    auth = getAuth(firebaseApp);
    
    // Connect to auth emulator in development (only once)
    if (process.env.NODE_ENV === 'development' && !isAuthEmulatorConnected) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        isAuthEmulatorConnected = true;
      } catch (error) {
        // Emulator might already be connected, ignore error
        console.log('Firebase Auth emulator connection info:', error);
      }
    }
  }
  return auth;
}
