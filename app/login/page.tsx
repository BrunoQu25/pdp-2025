'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HARDCODED_USERS } from '@/types';
import { clientLogger } from '@/lib/client-logger';
import { getFullAvatarUrl } from '@/lib/avatars';
import Image from 'next/image';

export default function LoginPage() {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const router = useRouter();

  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId);
    setError('');
    setPin(['', '', '', '']);
    setConfirmPin(['', '', '', '']);
    
    try {
      // Check if user has a PIN
      const response = await fetch(`/api/auth/pin?userId=${userId}`);
      const data = await response.json();
      
      if (data.hasPin) {
        // User has PIN, show PIN input for login
        setShowPinInput(true);
        setIsSettingPin(false);
        clientLogger.info('User has PIN, requesting login', 'Login', { userId });
      } else {
        // User doesn't have PIN, show PIN setup
        setShowPinInput(true);
        setIsSettingPin(true);
        clientLogger.info('User needs to set PIN', 'Login', { userId });
      }
    } catch (error) {
      clientLogger.error('Error checking PIN status', 'Login', error);
      setError('Error al verificar el usuario');
    }
  };

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newPin = isConfirm ? [...confirmPin] : [...pin];
    newPin[index] = value.slice(-1); // Only take last digit
    
    if (isConfirm) {
      setConfirmPin(newPin);
      // Auto-submit when confirm PIN is complete
      if (index === 3 && newPin.every(d => d !== '')) {
        setTimeout(() => {
          // Use the newPin array directly instead of state
          handlePinSubmitWithValues(pin, newPin);
        }, 100);
      }
    } else {
      setPin(newPin);
      // Auto-submit when PIN is complete (only if not setting PIN)
      if (index === 3 && newPin.every(d => d !== '')) {
        if (!isSettingPin) {
          setTimeout(() => {
            // Use the newPin array directly instead of state
            handlePinSubmitWithValues(newPin, confirmPin);
          }, 100);
        }
      }
    }
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(
        isConfirm ? `confirm-pin-${index + 1}` : `pin-${index + 1}`
      );
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, isConfirm = false) => {
    if (e.key === 'Backspace' && index > 0 && !(isConfirm ? confirmPin[index] : pin[index])) {
      const prevInput = document.getElementById(
        isConfirm ? `confirm-pin-${index - 1}` : `pin-${index - 1}`
      );
      prevInput?.focus();
    }
    if (e.key === 'Enter') {
      handlePinSubmit();
    }
  };

  const handlePinSubmitWithValues = async (pinArray: string[], confirmPinArray: string[]) => {
    const pinValue = pinArray.join('');
    
    if (pinValue.length !== 4) {
      setError('Por favor ingresa los 4 dígitos del PIN');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isSettingPin) {
        // Setting new PIN
        const confirmPinValue = confirmPinArray.join('');
        
        if (confirmPinValue.length !== 4) {
          setError('Por favor confirma los 4 dígitos del PIN');
          setIsLoading(false);
          return;
        }
        
        if (pinValue !== confirmPinValue) {
          setError('Los PINs no coinciden');
          setIsLoading(false);
          setConfirmPin(['', '', '', '']);
          return;
        }

        const response = await fetch('/api/auth/pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selectedUserId, pin: pinValue })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          clientLogger.info('PIN set successfully', 'Login', { userId: selectedUserId });
          
          // Login with credentials
          const result = await signIn('credentials', {
            username: data.username,
            redirect: false
          });

          if (result?.ok) {
            router.push('/');
          } else {
            setError('Error al iniciar sesión');
          }
        } else {
          setError(data.error || 'Error al establecer PIN');
        }
      } else {
        // Verifying existing PIN
        const response = await fetch('/api/auth/pin', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selectedUserId, pin: pinValue })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          clientLogger.info('PIN verified successfully', 'Login', { userId: selectedUserId });
          
          // Login with credentials
          const result = await signIn('credentials', {
            username: data.username,
            redirect: false
          });

          if (result?.ok) {
            router.push('/');
          } else {
            setError('Error al iniciar sesión');
          }
        } else {
          setError('PIN incorrecto');
          setPin(['', '', '', '']);
          // Focus first input
          setTimeout(() => document.getElementById('pin-0')?.focus(), 100);
        }
      }
    } catch (error) {
      clientLogger.error('Error with PIN', 'Login', error);
      setError('Error al procesar el PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = async () => {
    await handlePinSubmitWithValues(pin, confirmPin);
  };

  const handleBackToSelection = () => {
    setShowPinInput(false);
    setSelectedUserId('');
    setPin(['', '', '', '']);
    setConfirmPin(['', '', '', '']);
    setError('');
  };

  const selectedUser = HARDCODED_USERS.find(u => u.id === selectedUserId);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-100/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-gradient-to-br from-orange-100/30 to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Main content */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Main card */}
          <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-orange-500 to-blue-500"></div>
            
            <div className="relative p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-orange-600 to-blue-600 bg-clip-text text-transparent mb-2 tracking-tight">
                  PARQUE DEL PLATA 2025
                </h2>
                <div className="h-0.5 w-24 mx-auto bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full mb-3 opacity-60"></div>
                <p className="text-gray-600 text-base font-medium">
                  Merca, porro y whisky
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700 font-medium">
                    {error}
                  </p>
                </div>
              )}

              {!showPinInput ? (
                /* User Selection */
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Selecciona tu Perfil
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {HARDCODED_USERS.map((user, index) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleUserSelect(user.id)}
                        className="group relative p-4 rounded-2xl transition-all duration-300 bg-white border-2 border-gray-200 hover:border-orange-300 hover:shadow-md shadow-sm"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="relative w-16 h-16 mx-auto mb-3 rounded-2xl overflow-hidden flex items-center justify-center">
                          <Image
                            src={getFullAvatarUrl(user.photoUrl)}
                            alt={user.displayName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>

                        <p className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
                          {user.displayName}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* PIN Input */
                <div>
                  {/* Back button and user info */}
                  <button
                    onClick={handleBackToSelection}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">Volver</span>
                  </button>

                  {/* Selected user */}
                  {selectedUser && (
                    <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-orange-50">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden">
                        <Image
                          src={getFullAvatarUrl(selectedUser.photoUrl)}
                          alt={selectedUser.displayName}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{selectedUser.displayName}</h3>
                        <p className="text-sm text-gray-600">@{selectedUser.username}</p>
                      </div>
                    </div>
                  )}

                  {/* PIN Setup or Login */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {isSettingPin ? 'Crea tu PIN (4 dígitos)' : 'Ingresa tu PIN'}
                      </label>
                      <div className="flex gap-3 justify-center">
                        {pin.map((digit, index) => (
                          <input
                            key={index}
                            id={`pin-${index}`}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePinChange(index, e.target.value, false)}
                            onKeyDown={(e) => handleKeyDown(e, index, false)}
                            className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                            autoFocus={index === 0}
                          />
                        ))}
                      </div>
                    </div>

                    {isSettingPin && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Confirma tu PIN
                        </label>
                        <div className="flex gap-3 justify-center">
                          {confirmPin.map((digit, index) => (
                            <input
                              key={index}
                              id={`confirm-pin-${index}`}
                              type="password"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handlePinChange(index, e.target.value, true)}
                              onKeyDown={(e) => handleKeyDown(e, index, true)}
                              className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {isLoading && (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-xs italic">
                  &quot;Donde las leyendas se hacen, una bebida a la vez&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 mx-auto w-3/4 h-4 bg-gradient-to-b from-gray-900/10 to-transparent blur-xl rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
