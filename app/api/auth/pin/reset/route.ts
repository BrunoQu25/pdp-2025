import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    logger.info('PIN reset request received', 'API', { userId, body });

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId es requerido' },
        { status: 400 }
      );
    }

    const user = db.getUserById(userId);
    
    logger.info('User lookup result', 'API', { userId, found: !!user });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Check if user has a PIN before deleting
    const hadPin = db.auth.hasPin(userId);
    logger.info('PIN status before delete', 'API', { userId, hadPin });

    // Delete the PIN
    const deleted = db.auth.deletePinForUser(userId);

    logger.info('PIN reset completed', 'API', { userId, username: user.username, deleted });

    return NextResponse.json({
      success: true,
      username: user.username,
      hadPin,
      deleted
    });
  } catch (error) {
    logger.error('Error resetting PIN', 'API', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
