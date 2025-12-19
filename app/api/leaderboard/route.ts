import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = await db.users.getAll();
    const drinks = await db.drinks.getAll();

    // Calculate points only from non-deleted drinks
    const leaderboard = users
      .map(user => {
        const userDrinks = drinks.filter(d => d.userId === user.id && !d.deleted);
        const actualPoints = userDrinks.reduce((sum, drink) => sum + drink.points, 0);

        return {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          photoUrl: user.photoUrl,
          points: actualPoints
        };
      })
      .sort((a, b) => b.points - a.points);

    return NextResponse.json(leaderboard);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

