import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Endpoint para ver todos los bindings (solo para desarrollo/debug)
export async function GET() {
  try {
    const bindings = db.auth.getAllBindings();
    const bindingsArray = Array.from(bindings.entries()).map(([email, userId]) => {
      const user = db.users.getById(userId);
      return {
        email,
        userId,
        username: user?.username,
        displayName: user?.displayName
      };
    });

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
