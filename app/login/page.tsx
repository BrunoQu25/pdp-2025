'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HARDCODED_USERS } from '@/types';
import { clientLogger } from '@/lib/client-logger';
import { getFullAvatarUrl } from '@/lib/avatars';
import Image from 'next/image';

export default function LoginPage() {
  const [selectedUsername, setSelectedUsername] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showQuickLogin] = useState(() => {
    // Check if user has previously logged in with Google
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasGoogleLogin') === 'true';
    }
    return false;
  });
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user is already authenticated and bound
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const checkBinding = async () => {
        try {
          const response = await fetch('/api/auth/bind');
          const data = await response.json();
          
          if (data.bound) {
            // User is already bound, redirect to home
            clientLogger.info('User already bound, redirecting', 'Login', { userId: data.userId });
            router.push('/');
          }
        } catch (error) {
          clientLogger.error('Error checking binding', 'Login', error);
        }
      };
      checkBinding();
    }
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    if (!selectedUsername) {
      setError('Por favor selecciona tu perfil primero');
      return;
    }

    setError('');
    setIsGoogleLoading(true);
    
    try {
      const user = HARDCODED_USERS.find(u => u.username === selectedUsername);
      if (!user) {
        setError('Usuario no encontrado');
        setIsGoogleLoading(false);
        return;
      }

      clientLogger.action('Google sign-in attempt', 'Login', { username: selectedUsername });
      
      // Store selected user in sessionStorage for binding after Google auth
      sessionStorage.setItem('pendingBindUserId', user.id);
      
      // Mark that user has used Google login
      localStorage.setItem('hasGoogleLogin', 'true');
      
      // Initiate Google sign-in
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      clientLogger.error('Google sign-in failed', 'Login', error);
      setError('Error al iniciar sesión con Google');
      setIsGoogleLoading(false);
    }
  };

  const handleQuickGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      clientLogger.action('Quick Google sign-in', 'Login');
      // Use prompt: 'none' to skip account selection for returning users
      await signIn('google', { 
        callbackUrl: '/'
      });
    } catch (error) {
      clientLogger.error('Quick Google sign-in failed', 'Login', error);
      setError('Error al iniciar sesión con Google');
      setIsGoogleLoading(false);
    }
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

              {/* Quick Google Login - shown if user has logged in with Google before */}
              {showQuickLogin && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={handleQuickGoogleLogin}
                    disabled={isGoogleLoading}
                    className={`relative w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                      isGoogleLoading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-sm'
                        : 'bg-white text-gray-700 border-2 border-blue-400 shadow-lg hover:shadow-xl hover:border-blue-500 hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-3">
                      {isGoogleLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-700 rounded-full animate-spin"></div>
                          <span>Iniciando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span>Continuar con Google</span>
                        </>
                      )}
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">o elige tu perfil</span>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={!selectedUsername || isGoogleLoading}
                className={`relative w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                  !selectedUsername || isGoogleLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-sm'
                    : 'bg-white text-gray-700 border-2 border-gray-300 shadow-lg hover:shadow-xl hover:border-gray-400 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <span className="flex items-center justify-center gap-3">
                  {isGoogleLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-700 rounded-full animate-spin"></div>
                      <span>Iniciando con Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Iniciar con Google</span>
                    </>
                  )}
                </span>
              </button>

              {/* Footer tagline */}
              <div className="mt-6 text-center">
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
