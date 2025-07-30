'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SimpleAlert from '@/components/SimpleAlert';
import { IoEye, IoEyeOff } from 'react-icons/io5';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, user, loading } = useAuth();
  const router = useRouter();

  // Check if registration is enabled
  const isRegistrationEnabled = process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true';

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Redirect if registration is disabled
  useEffect(() => {
    if (!isRegistrationEnabled) {
      router.push('/login');
    }
  }, [isRegistrationEnabled, router]);

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

    const result = await register(email, password, name);

    if (result.success) {
      setSuccess('Conta criada com sucesso! Verifique seu email para ativar a conta.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      setError(result.error || 'Falha ao criar conta');
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

  if (!isRegistrationEnabled) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center text-2xl font-bold mb-6">
            Criar Conta
          </h2>

          {error && <SimpleAlert type="error" message={error} />}
          {success && <SimpleAlert type="success" message={success} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nome completo</span>
              </label>
              <input
                type="text"
                placeholder="Seu nome completo"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                minLength={2}
              />
            </div>

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

            <div className="form-control">
              <label className="label">
                <span className="label-text">Senha</span>
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
                  {showPassword ? <IoEye /> : <IoEyeOff />}
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
                <span className="label-text">Confirmar senha</span>
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
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </div>
          </form>

          <div className="divider">OU</div>

          <div className="text-center">
            <p>
              Já tem uma conta?{' '}
              <Link href="/login" className="link link-primary">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
