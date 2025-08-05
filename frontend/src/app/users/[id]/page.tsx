'use client'
import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useUser } from "@/features/user/hooks/useUser";

const UserForm = dynamic(() => import("@/features/user/components/UserForm").then(m => m.UserForm), {
  ssr: false,
});

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default function UserPage({ params }: UserPageProps) {
  const [userId, setUserId] = React.useState<string>('');
  const { user, loading: userLoading } = useUser(userId);

  React.useEffect(() => {
    params.then(p => setUserId(p.id));
  }, [params]);

  if (!userId) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link 
            href="/users" 
            className="text-black hover:underline text-sm mb-2 inline-block"
          >
            ← Back to Users
          </Link>
          <h1 className="text-3xl font-bold text-black">
            {userLoading ? 'Loading User...' : user ? `Edit ${user.name}` : 'Create New User'}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Form */}
        <div>
          <UserForm userId={userId} />
        </div>

        {/* User Details Display */}
        <div>
          {user && (
            <div className="bg-white p-6 border border-black">
              <h3 className="text-lg font-semibold mb-4 text-black">Current User Details</h3>
              
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-black">User ID</dt>
                  <dd className="mt-1 text-sm text-black font-mono bg-white px-2 py-1 border border-black">
                    {user.id}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-black">Name</dt>
                  <dd className="mt-1 text-sm text-black">{user.name}</dd>
                </div>

                {user.email && (
                  <div>
                    <dt className="text-sm font-medium text-black">Email</dt>
                    <dd className="mt-1 text-sm text-black">{user.email}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-black">ZIP Code</dt>
                  <dd className="mt-1 text-sm text-black">{user.zip}</dd>
                </div>

                {user.geoData ? (
                  <div>
                    <dt className="text-sm font-medium text-black">Location Information</dt>
                    <dd className="mt-1 text-sm text-black">
                      <div className="bg-white p-3 border border-black">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <strong>City:</strong> {user.geoData.cityName || 'Unknown'}
                          </div>
                          <div>
                            <strong>Timezone:</strong> {user.geoData.timezone || 'Unknown'}
                          </div>
                          <div>
                            <strong>Latitude:</strong> {user.geoData.lat?.toFixed(6) || 'Unknown'}
                          </div>
                          <div>
                            <strong>Longitude:</strong> {user.geoData.lon?.toFixed(6) || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </dd>
                  </div>
                ) : (
                  <div>
                    <dt className="text-sm font-medium text-black">Location Information</dt>
                    <dd className="mt-1 text-sm text-black">
                      Location data will be automatically fetched after saving
                    </dd>
                  </div>
                )}

                {user.lastRequestId && (
                  <div>
                    <dt className="text-sm font-medium text-black">Last Request ID</dt>
                    <dd className="mt-1 text-xs text-black font-mono bg-white px-2 py-1 border border-black">
                      {user.lastRequestId}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {!user && !userLoading && (
            <div className="bg-white p-6 border border-black">
              <h3 className="text-lg font-semibold mb-2 text-black">Creating New User</h3>
              <p className="text-sm text-black">
                Fill out the form to create a new user. Location data (latitude, longitude, and timezone) 
                will be automatically fetched based on the ZIP code you provide.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
