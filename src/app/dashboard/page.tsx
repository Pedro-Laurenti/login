"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        router.push("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="card bg-base-100 w-96 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold text-center">Dashboard</h1>
          <p className="text-center mt-4">Welcome to your dashboard!</p>
          <p className="text-center text-sm opacity-70 mt-2">
            You are successfully authenticated.
          </p>
          <div className="card-actions justify-center mt-6">
            <button
              className="btn btn-error"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Logout"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}