import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { DRINK_POINTS } from '@/types';
import { logger, logApiRequest, logApiResponse, logApiError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  logApiRequest(request, 'Get all drinks');
  
  try {
    const drinks = db.drinks.getAll();
    logger.info(`Retrieved ${drinks.length} drinks from database`, 'API:Drinks');
    logApiResponse(request, 200, { count: drinks.length });
    return NextResponse.json(drinks);
  } catch (error) {
    logger.error('Failed to fetch drinks', 'API:Drinks', error);
    logApiError(request, 500, error);
    return NextResponse.json({ error: 'Failed to fetch drinks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  logApiRequest(request, 'Create new drink');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      logger.warn('Unauthorized drink creation attempt', 'API:Drinks');
      logApiError(request, 401, 'No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { size, photoUrl } = body;
    
    logger.debug('Drink creation request', 'API:Drinks', { 
      userId: session.user.id, 
      size, 
      photoUrlLength: photoUrl?.length 
    });

    if (!size || !photoUrl) {
      logger.warn('Missing required fields for drink creation', 'API:Drinks', { size, photoUrl: !!photoUrl });
      logApiError(request, 400, 'Missing fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = db.users.getById(session.user.id);
    
    if (!user) {
      logger.error('User not found when creating drink', 'API:Drinks', null, { userId: session.user.id });
      logApiError(request, 404, 'User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const points = DRINK_POINTS[size as keyof typeof DRINK_POINTS] || 0;

    const drink = db.drinks.add({
      userId: user.id,
      username: user.username,
      size,
      points,
      photoUrl,
      timestamp: new Date(),
      votes: [],
      deleted: false
    });

    // Update user points
    db.users.updatePoints(user.id, points);

    logger.info(`Drink created successfully`, 'API:Drinks', {
      drinkId: drink.id,
      user: user.username,
      size,
      points,
      totalUserPoints: user.points + points
    });
    
    logApiResponse(request, 200, { drinkId: drink.id, points });

    return NextResponse.json(drink);
  } catch (error) {
    logger.error('Error creating drink', 'API:Drinks', error);
    logApiError(request, 500, error);
    return NextResponse.json({ error: 'Failed to create drink' }, { status: 500 });
  }
}

