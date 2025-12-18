'use client';

import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Leaderboard from '@/components/Leaderboard';
import Carousel from '@/components/Carousel';
import Link from 'next/link';

const RANDOM_PHRASES = [
  "Después no digas que no te gustó",
  "Desco no hay",
  "C limaron",
  "Se congeló la escarcha",
  "Cerré etapa con las vuelteras",
  "Me quise hacer el canchero y me salió como el orto",
  "No es alcoholismo si es en la playa 🏖️",
  "Merca, porro y whisky: la santísima trinidad 🙏",
  "1,2,3 El Cale",
  "Calentaron pija de TODOS los pibes",
  "No estoy pa esa porque es la ex de un amigo",
  "No la soltó nunca el hdp",
  "Buenas gente, espero que estén bien. Me comunico con ustedes porque (como algunos saben) hace tiempo ando con ganas de meter un Karting"
];

function HomePageContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [randomPhrase] = useState(() => 
    RANDOM_PHRASES[Math.floor(Math.random() * RANDOM_PHRASES.length)]
  );
  const [isBinding, setIsBinding] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated' && session) {
      const handleBinding = async () => {
        // Verificar si hay un usuario seleccionado pendiente de binding
        const selectedUserId = sessionStorage.getItem('pendingBindUserId') || localStorage.getItem('selectedUser');
        
        if (selectedUserId) {
          setIsBinding(true);
          try {
            // Intentar hacer el binding
            const response = await fetch('/api/auth/bind', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: selectedUserId })
            });

            const data = await response.json();

            if (data.success) {
              sessionStorage.removeItem('pendingBindUserId');
              localStorage.removeItem('selectedUser');
              
              // IMPORTANTE: Actualizar la sesión para reflejar el binding
              // Esto fuerza a NextAuth a re-evaluar los callbacks
              console.log('✅ Binding successful, updating session...');
              
              // Esperar un momento para que el binding se complete
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Actualizar la sesión - esto llama al callback session() nuevamente
              await update();
              
              // Esperar otro momento y recargar para asegurar que todo esté sincronizado
              await new Promise(resolve => setTimeout(resolve, 200));
              window.location.reload();
              
            } else if (response.status === 409) {
              // Usuario ya tomado por otro email
              alert(`El usuario ya está siendo usado por otra cuenta de Google. Por favor selecciona otro usuario.`);
              sessionStorage.removeItem('pendingBindUserId');
              localStorage.removeItem('selectedUser');
              await signOut({ callbackUrl: '/login' });
            }
          } catch (error) {
            console.error('Error binding user:', error);
            setIsBinding(false);
          }
        } else {
          // Verificar el estado del binding actual
          try {
            const response = await fetch('/api/auth/bind');
            const data = await response.json();
            
            if (!data.bound) {
              // No está vinculado, redirigir al login
              router.push('/login');
            }
          } catch (error) {
            console.error('Error checking bind status:', error);
          }
        }
      };

      handleBinding();
    }
  }, [status, session, router, update]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isBinding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vinculando tu cuenta...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Carousel */}
        <div className="mb-6">
          <Carousel />
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-gray-100">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-orange-600 to-blue-600 bg-clip-text text-transparent mb-2">
            ¡Bienvenido, {session.user.name}!
          </h1>
          <p className="text-gray-600 italic text-center">
            {randomPhrase}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            href="/upload"
            className="bg-white border-2 border-orange-400 text-orange-600 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center group"
          >
            <div className="mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="font-bold">Subir Bebida</div>
          </Link>

          <Link
            href="/history"
            className="bg-white border-2 border-blue-400 text-blue-600 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center group"
          >
            <div className="mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="font-bold">Ver Historial</div>
          </Link>
        </div>

        {/* Leaderboard */}
        <Leaderboard />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
