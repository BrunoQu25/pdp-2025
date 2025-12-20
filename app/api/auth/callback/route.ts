import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const email = session.user.email;

    // Check if user is already bound
    const boundUserId = await db.auth.getUserIdByEmail(email);

    if (boundUserId) {
      // Already bound, redirect to home
      logger.info('User already bound during callback', 'API:Callback', { email, userId: boundUserId });
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Not bound yet, redirect to home (the client will handle binding if needed)
    return NextResponse.redirect(new URL('/', request.url));

  } catch (error) {
    logger.error('Error in callback endpoint', 'API:Callback', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
