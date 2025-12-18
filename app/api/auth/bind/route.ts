import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const email = session.user.email;
    
    // Verificar si el email ya está vinculado
    const existingBinding = db.auth.getUserIdByEmail(email);
    if (existingBinding) {
      const user = db.users.getById(existingBinding);
      return NextResponse.json({
        success: true,
        alreadyBound: true,
        userId: existingBinding,
        username: user?.username
      });
    }

    // Verificar si el usuario solicitado ya está vinculado a otro email
    if (db.auth.isUserBound(userId)) {
      return NextResponse.json(
        { error: 'User already bound to another email', code: 'USER_TAKEN' },
        { status: 409 }
      );
    }

    // Verificar que el usuario existe
    const user = db.users.getById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Crear el binding
    const success = db.auth.bindEmailToUser(email, userId);
    
    if (success) {
      logger.info('Email successfully bound to user', 'API:Bind', {
        email,
        userId,
        username: user.username
      });

      return NextResponse.json({
        success: true,
        userId,
        username: user.username
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to bind email to user' },
        { status: 500 }
      );
    }

  } catch (error) {
    logger.error('Error in bind endpoint', 'API:Bind', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint para verificar el estado del binding
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { bound: false },
        { status: 200 }
      );
    }

    const email = session.user.email;
    const userId = db.auth.getUserIdByEmail(email);
    
    if (userId) {
      const user = db.users.getById(userId);
      return NextResponse.json({
        bound: true,
        userId,
        username: user?.username,
        displayName: user?.displayName
      });
    }

    return NextResponse.json({
      bound: false
    });

  } catch (error) {
    logger.error('Error checking bind status', 'API:Bind', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
