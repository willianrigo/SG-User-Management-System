"use client";
import { useState, useEffect } from "react";
import { ref, set, update } from "firebase/database";
import { getRTDB } from "@/shared/firebase/init";
import { createRequestId } from "@/shared/utils/requestId";
import { useRequestStatus } from "../hooks/useRequestStatus";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { IUser } from "../types";

const zipRegex = /^\d{5}$/;

export function UserForm({ userId }: { userId: string }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Use the authenticated user's UID, not the URL param
  const actualUserId = user?.uid || userId;
  const { status, loading: statusLoading } = useRequestStatus(actualUserId, requestId || "");

  // Feedback from enrichment
  const enrichmentError = status?.status === "error" ? status.errorMessage : null;

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
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Create / Update User</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="12345"
            pattern="[0-9]{5}"
            title="Please enter a 5-digit ZIP code"
            required
          />
          <p className="text-xs text-gray-500 mt-1">5-digit US ZIP code for automatic location lookup</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            "Save User"
          )}
        </button>
      </form>

      {localError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {localError}
          </div>
        </div>
      )}

      {requestId && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-blue-700 mb-2">
                Processing geolocation data...
              </p>
              <p className="text-xs text-blue-600 font-mono">
                Request ID: {requestId}
              </p>
              {statusLoading && (
                <div className="flex items-center mt-2">
                  <svg className="animate-spin h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm text-blue-600">Fetching location data...</span>
                </div>
              )}
              {!statusLoading && status && status.status === "success" && (
                <div className="flex items-center mt-2">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-600 font-medium">Location enriched successfully!</span>
                </div>
              )}
              {!statusLoading && enrichmentError && (
                <div className="flex items-start mt-2">
                  <svg className="w-4 h-4 text-red-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="text-sm text-red-600 font-medium">Enrichment failed:</span>
                    <p className="text-sm text-red-600">{enrichmentError}</p>
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
