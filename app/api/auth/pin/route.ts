import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// Set PIN for a user (first time login)
export async function POST(request: NextRequest) {
  try {
    const { userId, pin } = await request.json();
    
    if (!userId || !pin) {
      return NextResponse.json(
        { error: 'userId and pin are required' },
        { status: 400 }
      );
    }

    // Verify PIN format (4 digits)
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be 4 digits' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = db.users.getById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a PIN
    if (db.auth.hasPin(userId)) {
      return NextResponse.json(
        { error: 'User already has a PIN set' },
        { status: 409 }
      );
    }

    // Set the PIN
    const success = db.auth.setPinForUser(userId, pin);
    
    if (success) {
      logger.info('PIN set successfully', 'API:Pin', { userId, username: user.username });
      return NextResponse.json({
        success: true,
        userId,
        username: user.username
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to set PIN' },
        { status: 500 }
      );
    }

  } catch (error) {
    logger.error('Error in PIN set endpoint', 'API:Pin', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify PIN for login
export async function PUT(request: NextRequest) {
  try {
    const { userId, pin } = await request.json();
    
    if (!userId || !pin) {
      return NextResponse.json(
        { error: 'userId and pin are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = db.users.getById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify PIN
    const isValid = db.auth.verifyPin(userId, pin);
    
    if (isValid) {
      logger.info('PIN verified successfully', 'API:Pin', { userId, username: user.username });
      return NextResponse.json({
        success: true,
        userId,
        username: user.username,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          photoUrl: user.photoUrl
        }
      });
    } else {
      logger.warn('Invalid PIN attempt', 'API:Pin', { userId });
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

  } catch (error) {
    logger.error('Error in PIN verify endpoint', 'API:Pin', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Check if user has PIN
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      // If no userId, return all PINs (for debugging)
      const allPins = db.auth.getAllPins();
      const pinList = Array.from(allPins.entries()).map(([id, pin]) => ({
        userId: id,
        hasPin: true,
        pinPreview: pin.substring(0, 2) + '**'
      }));
      
      logger.info('All PINs requested', 'API:Pin', { count: pinList.length });
      
      return NextResponse.json({
        pins: pinList,
        count: pinList.length
      });
    }

    const hasPin = db.auth.hasPin(userId);
    
    return NextResponse.json({
      hasPin,
      userId
    });

  } catch (error) {
    logger.error('Error checking PIN status', 'API:Pin', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
