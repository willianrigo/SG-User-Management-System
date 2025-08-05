import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            User Management System
          </h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Manage users with automatic geolocation data fetching
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 text-center">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-black mb-2">User Management</h3>
            <p className="text-black">Create, read, update, and delete users</p>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-black mb-2">Geolocation</h3>
            <p className="text-black">Automatic location data from ZIP codes</p>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-black mb-2">Real-time</h3>
            <p className="text-black">Live data synchronization</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link
            href="/users"
            className="inline-block px-6 py-3 bg-black text-white font-medium border border-black hover:bg-white hover:text-black transition-colors"
          >
            Manage Users
          </Link>
        </div>
      </main>
    </div>
  );
}
