'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HARDCODED_USERS } from '@/types';
import { clientLogger } from '@/lib/client-logger';
import { getFullAvatarUrl } from '@/lib/avatars';
import Image from 'next/image';

export default function LoginPage() {
  const [selectedUsername, setSelectedUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Si ya está autenticado, verificar si está vinculado
  useEffect(() => {
    if (status === 'authenticated') {
      const checkBinding = async () => {
        try {
          const response = await fetch('/api/auth/bind');
          const data = await response.json();
          
          if (data.bound) {
            // Ya está vinculado, ir a home
            router.push('/');
          }
        } catch (error) {
          console.error('Error checking bind status:', error);
        }
      };
      
      checkBinding();
    }
  }, [status, router]);

  // Manejar errores de autenticación de Google
  const authError = searchParams.get('error');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUsername) {
      clientLogger.warn('Login attempt without username', 'Login');
      return;
    }

    const selectedUser = HARDCODED_USERS.find(u => u.username === selectedUsername);
    if (!selectedUser) {
      setError('Usuario no encontrado');
      return;
    }

    clientLogger.action('Google OAuth login attempt', 'Login', { username: selectedUsername });
    setIsLoading(true);
    setError('');

    // Guardar el usuario seleccionado en localStorage antes de redirigir
    localStorage.setItem('selectedUser', selectedUser.id);

    // Redirigir a Google OAuth
    await signIn('google', { 
      callbackUrl: '/' 
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Animated background elements - very subtle */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-100/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-gradient-to-br from-orange-100/30 to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Main content */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Main card with soft shadows */}
          <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100">
            {/* Subtle top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-orange-500 to-blue-500"></div>
            
            {/* Card content */}
            <div className="relative p-8">
              {/* Header with soft styling */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-orange-600 to-blue-600 bg-clip-text text-transparent mb-2 tracking-tight">
                  PARQUE DEL PLATA 2025
                </h2>
                <div className="h-0.5 w-24 mx-auto bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full mb-3 opacity-60"></div>
                <p className="text-gray-600 text-base font-medium">
                  Merca, porro y whisky
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Mostrar error si existe */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700 font-medium">
                      {error}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Selecciona tu Perfil
                  </label>
                  
                  {/* Radio-style cards with soft borders */}
                  <div className="grid grid-cols-2 gap-3">
                    {HARDCODED_USERS.map((user, index) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setSelectedUsername(user.username)}
                        className={`group relative p-4 rounded-2xl transition-all duration-300 ${
                          selectedUsername === user.username
                            ? 'bg-gradient-to-br from-blue-50 to-orange-50 border-2 border-orange-400 shadow-lg shadow-orange-100'
                            : 'bg-white border-2 border-gray-200 hover:border-orange-300 hover:shadow-md shadow-sm'
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {/* Radio indicator */}
                        <div className="absolute top-3 right-3 flex items-center justify-center">
                          <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                            selectedUsername === user.username
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {selectedUsername === user.username && (
                              <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Avatar with soft shadow */}
                        <div className={`relative w-16 h-16 mx-auto mb-3 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-bold transition-all duration-300 shadow-md ${
                          selectedUsername === user.username
                            ? 'ring-2 ring-orange-400 shadow-lg shadow-orange-200'
                            : 'ring-2 ring-transparent group-hover:ring-orange-300 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 group-hover:from-blue-50 group-hover:to-orange-50 group-hover:text-orange-600'
                        }`}>
                          {selectedUsername === user.username ? (
                            <Image
                              src={getFullAvatarUrl(user.photoUrl)}
                              alt={user.displayName}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span>{user.displayName[0]}</span>
                          )}
                        </div>

                        {/* Name */}
                        <p className={`text-sm font-semibold transition-colors ${
                          selectedUsername === user.username
                            ? 'text-orange-700'
                            : 'text-gray-700 group-hover:text-orange-600'
                        }`}>
                          {user.displayName}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Soft submit button */}
                <button
                  type="submit"
                  disabled={!selectedUsername || isLoading}
                  className={`relative w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                    !selectedUsername || isLoading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-sm'
                      : 'bg-gradient-to-r from-blue-500 via-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Redirigiendo a Google...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Iniciar con Google</span>
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Footer tagline */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-xs text-gray-500">
                  🔒 Autenticación segura con Google
                </p>
                <p className="text-gray-500 text-xs italic">
                  &quot;Donde las leyendas se hacen, una bebida a la vez&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Soft bottom shadow */}
          <div className="mt-4 mx-auto w-3/4 h-4 bg-gradient-to-b from-gray-900/10 to-transparent blur-xl rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
