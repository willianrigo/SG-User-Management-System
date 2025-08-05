"use client";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, signUp, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 border border-black">
      <h2 className="text-2xl font-bold text-center mb-6 text-black">
        {isSignUp ? "Create Account" : "Sign In"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-black px-3 py-2 focus:outline-none text-black"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-black px-3 py-2 focus:outline-none text-black"
            placeholder="Enter your password"
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="p-3 bg-white border border-black text-black">
            <div className="flex">
              <span className="mr-2">Error:</span>
              {error}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white font-medium px-4 py-2 border border-black hover:bg-white hover:text-black disabled:opacity-50 transition-colors focus:outline-none"
        >
          {loading ? (
            isSignUp ? "Creating Account..." : "Signing In..."
          ) : (
            isSignUp ? "Create Account" : "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-black hover:underline text-sm"
        >
          {isSignUp 
            ? "Already have an account? Sign in" 
            : "Don't have an account? Create one"
          }
        </button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-white border border-black">
          <p className="text-xs text-black">
            <strong>Development Mode:</strong> Using Firebase Auth emulator. 
            Any email/password combination will work for testing.
          </p>
        </div>
      )}
    </div>
  );
}