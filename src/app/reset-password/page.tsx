'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SimpleAlert from '@/components/SimpleAlert';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { resetPassword, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Check if password recovery is enabled
  const isPasswordRecoveryEnabled = process.env.NEXT_PUBLIC_ENABLE_PASSWORD_RECOVERY === 'true';

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Redirect if password recovery is disabled or no token
  useEffect(() => {
    if (!isPasswordRecoveryEnabled || !token) {
      router.push('/login');
    }
  }, [isPasswordRecoveryEnabled, token, router]);

  const validatePassword = (password: string) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('pelo menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('uma letra maiúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('uma letra minúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('um número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('um caractere especial');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate inputs
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`A senha deve conter: ${passwordErrors.join(', ')}`);
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError('Token de redefinição inválido');
      setIsLoading(false);
      return;
    }

    const result = await resetPassword(token, password);

    if (result.success) {
      setSuccess('Senha redefinida com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setError(result.error || 'Falha ao redefinir senha');
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

  if (!isPasswordRecoveryEnabled || !token) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center text-2xl font-bold mb-6">
            Redefinir Senha
          </h2>

          <p className="text-center text-base-content/70 mb-6">
            Digite sua nova senha abaixo.
          </p>

          {error && <SimpleAlert type="error" message={error} />}
          {success && <SimpleAlert type="success" message={success} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nova senha</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input input-bordered w-full pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt text-xs">
                  Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirmar nova senha</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
              </button>
            </div>
          </form>

          <div className="divider">OU</div>

          <div className="text-center">
            <p>
              Voltar para{' '}
              <Link href="/login" className="link link-primary">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading loading-spinner loading-lg"></div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
