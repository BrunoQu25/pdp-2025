import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

console.log('----------------------------------------');
console.log('🔍 Middleware Environment Check:');
console.log('NEXTAUTH_SECRET defined:', !!process.env.NEXTAUTH_SECRET);
console.log('----------------------------------------');

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without authentication
        if (req.nextUrl.pathname === '/login') {
          return true;
        }
        // Require authentication for all other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

