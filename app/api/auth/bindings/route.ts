import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Endpoint para ver todos los bindings (solo para desarrollo/debug)
export async function GET() {
  try {
    const bindings = await db.auth.getAllBindings();
    const bindingsArray = await Promise.all(Array.from(bindings.entries()).map(async ([email, userId]) => {
      const user = await db.users.getById(userId);
      return {
        email,
        userId,
        username: user?.username || 'Unknown',
        displayName: user?.displayName
      };
    }));

    return NextResponse.json({
      bindings: bindingsArray,
      count: bindingsArray.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
