import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import { db } from '@/lib/db';

// Endpoint para ver información del usuario autenticado (debug)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const dbUser = db.users.getById(userId);
    
    // Obtener el email de Google vinculado
    const googleEmail = db.auth.getEmailByUserId(userId);

    return NextResponse.json({
      session: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      },
      hardcodedUser: dbUser ? {
        id: dbUser.id,
        username: dbUser.username,
        displayName: dbUser.displayName,
        photoUrl: dbUser.photoUrl,
        points: dbUser.points
      } : null,
      googleEmail: googleEmail,
      bound: !!googleEmail
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
