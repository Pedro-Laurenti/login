'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      router.push('/login');
    };

    performLogout();
  }, [logout, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <h2 className="text-xl font-semibold">Saindo...</h2>
          <p className="text-base-content/70">Aguarde enquanto encerramos sua sessão.</p>
        </div>
      </div>
    </div>
  );
}