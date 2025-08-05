"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ref, set, update } from "firebase/database";
import { getRTDB } from "@/shared/firebase/init";
import { createRequestId } from "@/shared/utils/requestId";
import { useRequestStatus } from "../hooks/useRequestStatus";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { IUser } from "../types";

const zipRegex = /^\d{5}$/;

export function UserForm({ userId }: { userId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // For new users, use the URL param (generated ID), for existing users use their ID
  const actualUserId = userId;
  const { status, loading: statusLoading } = useRequestStatus(actualUserId, requestId || "");

  // Feedback from enrichment
  const enrichmentError = status?.status === "error" ? status.errorMessage : null;

  // Reset form state when userId changes (new user)
  useEffect(() => {
    setName("");
    setZip("");
    setEmail("");
    setRequestId(null);
    setLocalError(null);
    setSubmitting(false);
  }, [userId]);

  // Redirect to users list after successful enrichment
  useEffect(() => {
    if (!statusLoading && status && status.status === "success") {
      // Show success message for 2 seconds, then redirect
      const timer = setTimeout(() => {
        // Reset form state before redirect
        setName("");
        setZip("");
        setEmail("");
        setRequestId(null);
        setLocalError(null);
        router.push("/users");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [statusLoading, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!name.trim() || !zip.trim()) {
      setLocalError("Name and ZIP are required.");
      return;
    }
    if (!zipRegex.test(zip)) {
      setLocalError("ZIP must be 5 digits.");
      return;
    }

    const newRequestId = createRequestId();
    setRequestId(newRequestId);
    setSubmitting(true);

    const db = getRTDB();
    const userRef = ref(db, `/users/${actualUserId}`);
    const payload: Partial<IUser> = {
      id: actualUserId,
      name: name.trim(),
      zip: zip.trim(),
      email: email.trim() || user?.email || undefined,
      lastRequestId: newRequestId,
    };

    console.log("Creating/updating user with ID:", actualUserId, "Payload:", payload);

    try {
      // Upsert user basic info; Cloud Function will enrich asynchronously
      await set(userRef, payload);
    } catch (err) {
      setLocalError("Failed to write user data.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 border border-black">
      <h2 className="text-xl font-semibold mb-6 text-black">Create / Update User</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-black mb-2">Name *</label>
          <input
            type="text"
            className="w-full border border-black px-3 py-2 focus:outline-none text-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">ZIP Code *</label>
          <input
            type="text"
            className="w-full border border-black px-3 py-2 focus:outline-none text-black"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="12345"
            pattern="[0-9]{5}"
            title="Please enter a 5-digit ZIP code"
            required
          />
          <p className="text-xs text-black mt-1">5-digit US ZIP code for automatic location lookup</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">Email (optional)</label>
          <input
            type="email"
            className="w-full border border-black px-3 py-2 focus:outline-none text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white font-medium px-4 py-2 border border-black hover:bg-white hover:text-black disabled:opacity-50 transition-colors focus:outline-none"
        >
          {submitting ? "Saving..." : "Save User"}
        </button>
      </form>

      {localError && (
        <div className="mt-4 p-3 bg-white border border-black text-black">
          <div className="flex">
            <span className="mr-2">Error:</span>
            {localError}
          </div>
        </div>
      )}

      {requestId && (
        <div className="mt-4 p-4 bg-white border border-black">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-sm text-black mb-2">
                Processing geolocation data...
              </p>
              <p className="text-xs text-black font-mono">
                Request ID: {requestId}
              </p>
              {statusLoading && (
                <div className="flex items-center mt-2">
                  <span className="text-sm text-black">Fetching location data...</span>
                </div>
              )}
              {!statusLoading && status && status.status === "success" && (
                <div className="flex items-center mt-2">
                  <span className="text-sm text-black font-medium">Location enriched successfully - Redirecting to users list...</span>
                </div>
              )}
              {!statusLoading && enrichmentError && (
                <div className="flex items-start mt-2">
                  <div>
                    <span className="text-sm text-black font-medium">Enrichment failed:</span>
                    <p className="text-sm text-black">{enrichmentError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
