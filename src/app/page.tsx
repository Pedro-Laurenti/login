'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Página de boas-vindas temporária enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <h1 className="text-4xl font-bold mb-4">🔐</h1>
          <h2 className="card-title text-center text-2xl font-bold mb-6">
            Sistema de Login
          </h2>
          <p className="text-base-content/70 mb-6">
            Um sistema de autenticação completo com Next.js, PostgreSQL e recursos configuráveis.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Link href="/login" className="btn btn-primary">
                Fazer Login
              </Link>
              {process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true' && (
                <Link href="/register" className="btn btn-outline">
                  Criar Conta
                </Link>
              )}
            </div>
          </div>

          <div className="mt-8 text-sm text-base-content/50">
            <p>Recursos:</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <span className="badge badge-outline">🔒 Autenticação JWT</span>
              <span className="badge badge-outline">🗄️ PostgreSQL</span>
              <span className="badge badge-outline">🔄 Tokens automáticos</span>
              {process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true' && (
                <span className="badge badge-outline">📝 Registro</span>
              )}
              {process.env.NEXT_PUBLIC_ENABLE_PASSWORD_RECOVERY === 'true' && (
                <span className="badge badge-outline">🔄 Recuperação</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}