'use client';

import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SimpleAlert from '@/components/SimpleAlert';

export default function Dashboard() {
  const { user, logout, logoutAll, resendVerification, loading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/login');
  };

  const handleLogoutAll = async () => {
    setIsLoggingOut(true);
    await logoutAll();
    router.push('/login');
  };

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    setMessage('');

    const result = await resendVerification();
    
    if (result.success) {
      setMessage('Email de verificação enviado com sucesso!');
      setMessageType('success');
    } else {
      setMessage(result.error || 'Falha ao enviar email de verificação');
      setMessageType('error');
    }

    setIsResendingVerification(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="navbar bg-base-100 rounded-box shadow-lg mb-6">
          <div className="flex-1">
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          <div className="flex-none gap-2">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                <li><a onClick={handleLogout} className={isLoggingOut ? 'loading' : ''}>Logout</a></li>
                <li><a onClick={handleLogoutAll} className={isLoggingOut ? 'loading' : ''}>Logout de todos dispositivos</a></li>
              </ul>
            </div>
          </div>
        </div>

        {message && <SimpleAlert type={messageType} message={message} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Info Card */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">
                <span>👤</span>
                Informações do Usuário
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="label">
                    <span className="label-text">Nome:</span>
                  </label>
                  <div className="font-medium">{user.name}</div>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Email:</span>
                  </label>
                  <div className="font-medium">{user.email}</div>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Status de verificação:</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {user.email_verified ? (
                      <span className="badge badge-success">✓ Verificado</span>
                    ) : (
                      <span className="badge badge-warning">⚠ Não verificado</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Membro desde:</span>
                  </label>
                  <div className="font-medium">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {!user.email_verified && (
                <div className="card-actions justify-start mt-4">
                  <button
                    className={`btn btn-sm btn-warning ${isResendingVerification ? 'loading' : ''}`}
                    onClick={handleResendVerification}
                    disabled={isResendingVerification}
                  >
                    {isResendingVerification ? 'Enviando...' : 'Reenviar verificação'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* System Features Card */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">
                <span>⚙️</span>
                Recursos do Sistema
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Registro de usuários:</span>
                  <span className={`badge ${process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true' ? 'badge-success' : 'badge-error'}`}>
                    {process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true' ? 'Habilitado' : 'Desabilitado'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Recuperação de senha:</span>
                  <span className={`badge ${process.env.NEXT_PUBLIC_ENABLE_PASSWORD_RECOVERY === 'true' ? 'badge-success' : 'badge-error'}`}>
                    {process.env.NEXT_PUBLIC_ENABLE_PASSWORD_RECOVERY === 'true' ? 'Habilitado' : 'Desabilitado'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Autenticação automática:</span>
                  <span className="badge badge-success">✓ Ativo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tokens seguros:</span>
                  <span className="badge badge-success">✓ Implementado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Info Card */}
          <div className="card bg-base-100 shadow-lg lg:col-span-2">
            <div className="card-body">
              <h2 className="card-title">
                <span>🔐</span>
                Informações da Sessão
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Última atualização:</span>
                  </label>
                  <div className="font-medium">
                    {new Date(user.updated_at).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Token válido:</span>
                  </label>
                  <div className="font-medium text-success">✓ Ativo</div>
                </div>
              </div>
              
              <div className="card-actions justify-end mt-4">
                <button
                  className={`btn btn-outline btn-error ${isLoggingOut ? 'loading' : ''}`}
                  onClick={handleLogoutAll}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Saindo...' : 'Sair de todos dispositivos'}
                </button>
                <button
                  className={`btn btn-error ${isLoggingOut ? 'loading' : ''}`}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Saindo...' : 'Sair'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}