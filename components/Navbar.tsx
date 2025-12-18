'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getFullAvatarUrl } from '@/lib/avatars';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 text-gray-800 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-white/95">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
              Parque del Plata 2025
            </span>
          </Link>

          {session?.user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{session.user.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center hover:shadow-lg transition-all hover:scale-105 shadow-md overflow-hidden"
              >
                {session.user.image ? (
                  <Image
                    src={getFullAvatarUrl(session.user.image)}
                    alt={session.user.name || 'Usuario'}
                    width={40}
                    height={40}
                    className="w-full h-full rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {session.user.name?.[0] || '?'}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
