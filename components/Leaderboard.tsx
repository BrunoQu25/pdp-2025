'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string;
  photoUrl: string;
  points: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // Refresh every 2 minutes for real-time updates
    const interval = setInterval(fetchLeaderboard, 120000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-500 via-orange-500 to-orange-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          🏆 Tabla de Posiciones
        </h2>
      </div>

      <div className="divide-y divide-gray-100">
        {leaderboard.map((entry, index) => (
          <a
            href={`/user/${entry.id}`}
            key={entry.id}
            className={`flex items-center gap-4 p-4 transition-all cursor-pointer ${
              index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex-shrink-0">
              <div className={`text-2xl font-bold ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-gray-400' :
                index === 2 ? 'text-orange-600' :
                'text-gray-400'
              }`}>
                {index === 0 ? '👑' : `#${index + 1}`}
              </div>
            </div>

            <div className="w-12 h-12 rounded-full flex-shrink-0 shadow-md ring-2 ring-white bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {entry.displayName[0].toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {entry.displayName}
              </h3>
              <p className="text-sm text-gray-500">@{entry.username}</p>
            </div>

            <div className="flex-shrink-0">
              <div className="bg-gradient-to-r from-blue-500 via-orange-500 to-orange-600 text-white px-4 py-2 rounded-full font-bold shadow-md">
                {entry.points} pts
              </div>
            </div>
          </a>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay bebidas registradas aún. ¡Sé el primero! 🍺
        </div>
      )}
    </div>
  );
}
