'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Drink } from '@/types';
import { HARDCODED_USERS } from '@/types';
import Link from 'next/link';
import { clientLogger } from '@/lib/client-logger';

export default function DrinkDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const drinkId = params.drinkId as string;
  const [drink, setDrink] = useState<Drink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchDrink = async () => {
      try {
        clientLogger.apiCall('GET', '/api/drinks', { drinkId });
        const response = await fetch('/api/drinks');
        const data = await response.json();
        const foundDrink = data.find((d: Drink) => d.id === drinkId);
        setDrink(foundDrink || null);
        
        if (foundDrink) {
          clientLogger.info('Drink loaded', 'DrinkDetail', {
            drinkId,
            username: foundDrink.username,
            size: foundDrink.size,
            votes: foundDrink.votes.length,
            deleted: foundDrink.deleted
          });
        } else {
          clientLogger.warn('Drink not found', 'DrinkDetail', { drinkId });
        }
        
        // Check if current user has voted
        if (foundDrink && session?.user?.id) {
          setHasVoted(foundDrink.votes.includes(session.user.id));
        }
        clientLogger.apiSuccess('GET', '/api/drinks', { found: !!foundDrink });
      } catch (error) {
        clientLogger.apiError('GET', '/api/drinks', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrink();
  }, [status, router, drinkId, session]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSizeEmoji = (size: string) => {
    const emojis: Record<string, string> = {
      'small': '🥃',
      'medium': '🍺',
      'large': '🍻',
      'extra-large': '🍾'
    };
    return emojis[size] || '🍺';
  };

  const getSizeLabel = (size: string) => {
    const labels: Record<string, string> = {
      'small': 'Pequeño',
      'medium': 'Mediano',
      'large': 'Grande',
      'extra-large': 'Extra Grande'
    };
    return labels[size] || size;
  };

  const getSizeDescription = (size: string) => {
    const descriptions: Record<string, string> = {
      'small': 'Un shot o bebida pequeña - perfecto para calentar motores',
      'medium': 'Una cerveza estándar o copa mediana - el clásico',
      'large': 'Una cerveza grande o doble - para los valientes',
      'extra-large': 'Una botella o jarra - ¡modo leyenda activado!'
    };
    return descriptions[size] || '';
  };

  const handleVote = async () => {
    if (!drink || hasVoted || drink.deleted) {
      clientLogger.warn('Vote attempt blocked', 'DrinkDetail', { 
        hasDrink: !!drink, 
        hasVoted, 
        isDeleted: drink?.deleted 
      });
      return;
    }

    clientLogger.action('Voting against drink', 'DrinkDetail', { drinkId, currentVotes: drink.votes.length });
    setIsVoting(true);

    try {
      clientLogger.apiCall('POST', `/api/drinks/${drinkId}/vote`);
      const response = await fetch(`/api/drinks/${drinkId}/vote`, {
        method: 'POST'
      });

      if (!response.ok) {
        clientLogger.apiError('POST', `/api/drinks/${drinkId}/vote`, await response.text());
        throw new Error('Failed to vote');
      }

      const data = await response.json();
      clientLogger.apiSuccess('POST', `/api/drinks/${drinkId}/vote`, { 
        voteCount: data.voteCount, 
        deleted: data.deleted 
      });
      
      setDrink(data.drink);
      setHasVoted(true);

      if (data.deleted) {
        clientLogger.warn('🚨 Drink eliminated by community', 'DrinkDetail', {
          drinkId,
          finalVoteCount: data.voteCount
        });
        alert('Esta bebida ha sido eliminada por exceso de votos en contra. Los puntos han sido restados del usuario.');
      } else {
        clientLogger.info('Vote recorded successfully', 'DrinkDetail', { 
          drinkId, 
          newVoteCount: data.voteCount 
        });
      }
    } catch (error) {
      clientLogger.error('Error voting', 'DrinkDetail', error);
      alert('Error al votar. Por favor intenta de nuevo.');
    } finally {
      setIsVoting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!drink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 text-center">
            <p className="text-xl text-gray-700">Bebida no encontrada</p>
            <Link href="/history" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
              Volver al historial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const user = HARDCODED_USERS.find(u => u.id === drink.userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Photo */}
          <div 
            className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer group"
            onClick={() => setIsImageEnlarged(true)}
          >
            <img
              src={drink.photoUrl}
              alt="Foto de la bebida"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-drink.jpg';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Deleted Banner */}
            {drink.deleted && (
              <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-800">Entrada Eliminada</h3>
                    <p className="text-sm text-red-700">Esta bebida fue cuestionada y eliminada por la comunidad el {drink.deletedAt ? formatDate(drink.deletedAt) : 'fecha desconocida'}. Los puntos fueron restados.</p>
                  </div>
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="flex items-center justify-between">
              <Link 
                href={`/user/${drink.userId}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-orange-500 to-orange-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                  {user?.displayName[0] || '?'}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">{user?.displayName || 'Usuario'}</h2>
                  <p className="text-sm text-gray-500">@{drink.username}</p>
                </div>
              </Link>

              <div className="bg-gradient-to-r from-blue-500 via-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold text-xl shadow-lg">
                +{drink.points} pts
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100"></div>

            {/* Drink Size */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Tamaño
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-5xl">{getSizeEmoji(drink.size)}</span>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{getSizeLabel(drink.size)}</p>
                  <p className="text-sm text-gray-600 mt-1">{getSizeDescription(drink.size)}</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100"></div>

            {/* Timestamp */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Fecha y Hora
              </h3>
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg">{formatDate(drink.timestamp)}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100"></div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`bg-gradient-to-br rounded-xl p-4 text-center ${
                drink.deleted ? 'from-gray-100 to-gray-200' : 'from-blue-50 to-blue-100'
              }`}>
                <div className={`text-2xl font-bold ${drink.deleted ? 'text-gray-500 line-through' : 'text-blue-600'}`}>
                  {drink.points}
                </div>
                <p className="text-xs text-gray-600 mt-1">Puntos</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{getSizeEmoji(drink.size)}</div>
                <p className="text-xs text-gray-600 mt-1">Tamaño</p>
              </div>
              <div className={`bg-gradient-to-br rounded-xl p-4 text-center ${
                drink.deleted ? 'from-red-50 to-red-100' : drink.votes.length > 5 ? 'from-yellow-50 to-yellow-100' : 'from-green-50 to-green-100'
              }`}>
                <div className={`text-2xl font-bold ${
                  drink.deleted ? 'text-red-600' : drink.votes.length > 5 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {drink.deleted ? '✗' : drink.votes.length > 5 ? '⚠' : '✓'}
                </div>
                <p className="text-xs text-gray-600 mt-1">{drink.deleted ? 'Eliminado' : drink.votes.length > 5 ? 'En Duda' : 'Verificado'}</p>
              </div>
            </div>

            {/* Voting Section */}
            {!drink.deleted && session?.user?.id !== drink.userId && (
              <>
                <div className="border-t border-gray-100"></div>
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">¿Esta foto no corresponde?</h3>
                      <p className="text-sm text-gray-600">Si crees que esta bebida no es válida, puedes votar en contra. Con más de 10 votos se eliminará automáticamente.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-bold text-gray-800">{drink.votes.length}</span>
                      <span className="text-gray-600"> / 10 votos en contra</span>
                    </div>
                    
                    <button
                      onClick={handleVote}
                      disabled={hasVoted || isVoting}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        hasVoted
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg'
                      }`}
                    >
                      {isVoting ? 'Votando...' : hasVoted ? 'Ya Votaste' : 'Votar en Contra'}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        drink.votes.length > 7 ? 'bg-red-500' : drink.votes.length > 4 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min((drink.votes.length / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </>
            )}

            {drink.deleted && (
              <>
                <div className="border-t border-gray-100"></div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-600">
                    Esta entrada recibió <span className="font-bold text-red-600">{drink.votes.length} votos en contra</span> y fue eliminada por la comunidad.
                  </p>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => router.push('/history')}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Ver Todo el Historial
              </button>
              <button
                onClick={() => router.push(`/user/${drink.userId}`)}
                className="flex-1 bg-gradient-to-r from-blue-500 via-orange-500 to-orange-600 text-white py-3 rounded-2xl font-semibold hover:shadow-xl transition-all shadow-lg"
              >
                Ver Perfil de {user?.displayName}
              </button>
            </div>
          </div>
        </div>

        {/* ID Info (for debugging/reference) */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">ID: {drink.id}</p>
        </div>
      </div>

      {/* Image Modal */}
      {isImageEnlarged && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsImageEnlarged(false)}
        >
          <button
            onClick={() => setIsImageEnlarged(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all z-10"
            aria-label="Cerrar"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={drink.photoUrl}
              alt="Foto de la bebida ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-drink.jpg';
              }}
            />
            <p className="text-center text-white/70 text-sm mt-4">
              Click fuera de la imagen para cerrar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

