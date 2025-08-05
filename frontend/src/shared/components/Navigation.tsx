"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function Navigation() {
  const pathname = usePathname();
  const { user, logOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-black">User Management System</h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/') && pathname === '/'
                    ? 'text-black underline'
                    : 'text-black hover:underline'
                }`}
              >
                Home
              </Link>
              <Link
                href="/users"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/users')
                    ? 'text-black underline'
                    : 'text-black hover:underline'
                }`}
              >
                Users
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm text-black">
                  {user.email}
                </span>
                <Link
                  href="/users"
                  className="bg-black text-white px-4 py-2 text-sm font-medium border border-black hover:bg-white hover:text-black transition-colors"
                >
                  Manage Users
                </Link>
                <button
                  onClick={logOut}
                  className="text-black hover:underline px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}