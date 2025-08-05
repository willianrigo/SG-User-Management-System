"use client";
import Link from "next/link";
import { useState } from "react";
import { useUsers } from "@/features/user/hooks/useUsers";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function UsersPage() {
  const { user } = useAuth();
  const { usersList, loading, error, deleteUser } = useUsers();
  const [deletingUsers, setDeletingUsers] = useState<Set<string>>(new Set());

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setDeletingUsers(prev => new Set(prev).add(userId));
      const success = await deleteUser(userId);
      if (!success) {
        alert("Failed to delete user. Please try again.");
      }
      setDeletingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const generateNewUserId = () => {
    return `/users/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-lg">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading users: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">User Management</h1>
        <Link
          href={generateNewUserId()}
          className="bg-black text-white px-4 py-2 font-medium border border-black hover:bg-white hover:text-black transition-colors"
        >
          Add New User
        </Link>
      </div>

      {usersList.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-black text-lg">No users found</div>
          <div className="text-black mt-2">Add your first user to get started</div>
        </div>
      ) : (
        <div className="bg-white border border-black overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-black">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-black">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-black">
                    ZIP Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-black">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-black">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-black">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">
                        {user.email || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{user.zip}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">
                        {user.geoData?.cityName ? (
                          <div>
                            <div className="font-medium">{user.geoData.cityName}</div>
                            <div className="text-xs">
                              {user.geoData.lat?.toFixed(4)}, {user.geoData.lon?.toFixed(4)}
                            </div>
                          </div>
                        ) : (
                          "Loading location..."
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/users/${user.id}`}
                        className="text-black hover:underline transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingUsers.has(user.id)}
                        className="text-black hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {deletingUsers.has(user.id) ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8 text-sm text-black">
        <p className="mb-2">
          <strong>Total Users:</strong> {usersList.length}
        </p>
        <p>
          Location data is automatically fetched when users are created or their ZIP code is updated.
        </p>
      </div>
    </div>
  );
}