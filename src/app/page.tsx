"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const MIN_LOADING_TIME = 1000; // 1 segundo
    const startTime = Date.now();

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const elapsedTime = Date.now() - startTime;
    const remainingTime = MIN_LOADING_TIME - elapsedTime;

    // Aguarda o tempo mínimo de carregamento
    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    setLoading(false);

    if (response.ok) {
      router.push("/dashboard");
    } else {
      const data = await response.json();
      setError(data.message || "Erro ao fazer login");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-base-200">
      <form
        onSubmit={handleLogin}
        className="card bg-base-100 shadow-md p-6 w-96"
      >
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {error && <p className="text-error mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input
            type="password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? <span className="loading loading-spinner"></span> : "Entrar"}
        </button>
      </form>
    </div>
  );
}
