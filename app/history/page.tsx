'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Drink } from '@/types';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchDrinks = async () => {
      try {
        const response = await fetch('/api/drinks');
        const data = await response.json();
        setDrinks(data.sort((a: Drink, b: Drink) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } catch (error) {
        console.error('Error fetching drinks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrinks();
  }, [status, router]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-ES', {
      month: 'short',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-orange-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
            <span>📜</span>
            Historial de Bebidas
          </h1>

          {drinks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-6xl mb-4">🍺</p>
              <p className="text-xl font-semibold text-gray-700">No hay bebidas registradas aún</p>
              <p className="mt-2">¡Sé el primero en subir una bebida!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {drinks.map((drink) => (
                <a
                  key={drink.id}
                  href={`/drink/${drink.id}`}
                  className={`block border rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer ${
                    drink.deleted 
                      ? 'bg-red-50 border-red-300 opacity-75' 
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex gap-4 p-4">
                    <div className="flex-shrink-0 relative">
                      <img
                        src={drink.photoUrl}
                        alt="Prueba de bebida"
                        className={`w-24 h-24 rounded-xl object-cover shadow-sm ${
                          drink.deleted ? 'grayscale opacity-60' : ''
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-drink.jpg';
                        }}
                      />
                      {drink.deleted && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg">
                            ✗
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">
                            @{drink.username}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(drink.timestamp)}
                          </p>
                          {drink.deleted && (
                            <span className="inline-block mt-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                              Eliminada
                            </span>
                          )}
                        </div>
                        <div className={`px-3 py-1 rounded-full font-bold text-sm shadow-sm ${
                          drink.deleted
                            ? 'bg-gray-300 text-gray-600 line-through'
                            : 'bg-gradient-to-r from-blue-500 via-orange-500 to-orange-600 text-white'
                        }`}>
                          +{drink.points} pts
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-2xl">{getSizeEmoji(drink.size)}</span>
                        <span className="font-medium">{getSizeLabel(drink.size)}</span>
                        {drink.votes && drink.votes.length > 0 && !drink.deleted && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                            {drink.votes.length} voto{drink.votes.length !== 1 ? 's' : ''} en contra
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
