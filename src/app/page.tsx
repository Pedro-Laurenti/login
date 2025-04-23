"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineUser } from "react-icons/ai";
import Alert from "@/components/Alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    setShowAlert(false);

    // Validação local
    if (!email || !password) {
      setError("Preencha todos os campos.");
      setShowAlert(true);
      return;
    }

    setLoading(true);

    const MIN_LOADING_TIME = 1000; // 1 segundo
    const startTime = Date.now();

    try {
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
        setShowAlert(true);
      }
    } catch (err) {
      setLoading(false);
      setError("Erro ao conectar ao servidor.");
      setShowAlert(true);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-base-100">
      {showAlert && (
        <Alert
          type="error"
          message={error}
          onClose={() => setShowAlert(false)}
        />
      )}
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Login</legend>

        <label className="label">Email</label>
        <label className="input validator">
          <AiOutlineUser />
          <input
            type="email"
            required
            placeholder="Email"
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            title="Enter a valid email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <p className="validator-hint">Must be a valid email address</p>

        <label className="label">Senha</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <span className="loading loading-spinner"></span> : "Entrar"}
        </button>
      </fieldset>
    </div>
  );
}
