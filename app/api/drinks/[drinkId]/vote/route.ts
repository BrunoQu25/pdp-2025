import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { logger, logApiRequest, logApiResponse, logApiError } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ drinkId: string }> }
) {
  logApiRequest(request, 'Vote against drink');

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      logger.warn('Unauthorized vote attempt', 'API:Vote');
      logApiError(request, 401, 'No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { drinkId } = await params;
    const voterId = session.user.id;

    logger.debug('Processing vote', 'API:Vote', { drinkId, voterId });

    const result = await db.drinks.vote(drinkId, voterId);

    if (!result.drink) {
      logger.warn('Vote failed - drink not found', 'API:Vote', { drinkId });
      logApiError(request, 404, 'Drink not found');
      return NextResponse.json({ error: 'Drink not found' }, { status: 404 });
    }

    if (result.deleted) {
      logger.info(`🚨 Drink deleted due to votes`, 'API:Vote', {
        drinkId,
        voteCount: result.drink.votes.length,
        drinkOwner: result.drink.username
      });
    } else {
      logger.info('Vote recorded', 'API:Vote', {
        drinkId,
        voteCount: result.drink.votes.length,
        voterId
      });
    }

    logApiResponse(request, 200, {
      voteCount: result.drink.votes.length,
      deleted: result.deleted
    });

    return NextResponse.json({
      drink: result.drink,
      deleted: result.deleted,
      voteCount: result.drink.votes.length
    });
  } catch (error) {
    logger.error('Error processing vote', 'API:Vote', error);
    logApiError(request, 500, error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}

