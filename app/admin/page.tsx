'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HARDCODED_USERS } from '@/types';
import { getFullAvatarUrl } from '@/lib/avatars';
import Image from 'next/image';
import { clientLogger } from '@/lib/client-logger';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resetting, setResetting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.id !== '1') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (session?.user?.id !== '1') {
    return null;
  }

  const handleResetPin = async (userId: string) => {
    const targetUser = HARDCODED_USERS.find(u => u.id === userId);
    clientLogger.info('Reset PIN requested', 'Admin', { userId, username: targetUser?.username });
    
    if (!confirm(`¿Estás seguro de que quieres resetear el PIN de ${targetUser?.displayName}?`)) {
      return;
    }

    setResetting(userId);
    setMessage(null);

    try {
      clientLogger.info('Sending reset request', 'Admin', { userId });
      
      const response = await fetch('/api/auth/pin/reset', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      clientLogger.info('Reset response received', 'Admin', { data, status: response.status });

      if (response.ok && data.success) {
        clientLogger.info('PIN reset successfully', 'Admin', { userId, hadPin: data.hadPin, deleted: data.deleted });
        setMessage({ type: 'success', text: `PIN de ${data.username} reseteado correctamente` });
      } else {
        clientLogger.error('PIN reset failed', 'Admin', { error: data.error, status: response.status });
        setMessage({ type: 'error', text: data.error || 'Error al resetear PIN' });
      }
    } catch (error) {
      clientLogger.error('Error resetting PIN', 'Admin', error);
      setMessage({ type: 'error', text: 'Error al resetear PIN' });
    } finally {
      setResetting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Volver al inicio</span>
          </button>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">Gestión de PINs de usuarios</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Users Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Resetear PINs</h2>
          <p className="text-sm text-gray-600 mb-6">
            Al resetear un PIN, el usuario deberá crear uno nuevo la próxima vez que inicie sesión.
          </p>

          <div className="space-y-3">
            {HARDCODED_USERS.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-orange-200 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    <Image
                      src={getFullAvatarUrl(user.photoUrl)}
                      alt={user.displayName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{user.displayName}</h3>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleResetPin(user.id)}
                  disabled={resetting === user.id}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {resetting === user.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Reseteando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Resetear PIN</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Información</h3>
              <p className="text-sm text-blue-800">
                Esta sección solo está disponible para administradores. Los cambios son inmediatos y los usuarios afectados deberán crear un nuevo PIN en su próximo inicio de sesión.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
