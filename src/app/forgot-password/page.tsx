'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SimpleAlert from '@/components/SimpleAlert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { forgotPassword, user, loading } = useAuth();
  const router = useRouter();

  // Check if password recovery is enabled
  const isPasswordRecoveryEnabled = process.env.NEXT_PUBLIC_ENABLE_PASSWORD_RECOVERY === 'true';

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Redirect if password recovery is disabled
  useEffect(() => {
    if (!isPasswordRecoveryEnabled) {
      router.push('/login');
    }
  }, [isPasswordRecoveryEnabled, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const result = await forgotPassword(email);

    if (result.success) {
      setSuccess('Se existe uma conta com este email, você receberá instruções para redefinir sua senha.');
    } else {
      setError(result.error || 'Falha ao enviar email de recuperação');
    }

    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!isPasswordRecoveryEnabled) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center text-2xl font-bold mb-6">
            Recuperar Senha
          </h2>

          <p className="text-center text-base-content/70 mb-6">
            Digite seu email para receber instruções de recuperação de senha.
          </p>

          {error && <SimpleAlert type="error" message={error} />}
          {success && <SimpleAlert type="success" message={success} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar instruções'}
              </button>
            </div>
          </form>

          <div className="divider">OU</div>

          <div className="text-center space-y-2">
            <p>
              Lembrou da senha?{' '}
              <Link href="/login" className="link link-primary">
                Fazer login
              </Link>
            </p>

            {process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true' && (
              <p>
                Não tem uma conta?{' '}
                <Link href="/register" className="link link-secondary">
                  Criar conta
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
