import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// Debug environment variables
console.log('----------------------------------------');
console.log('🔍 Auth Route Environment Check:');
console.log('NEXTAUTH_SECRET defined:', !!process.env.NEXTAUTH_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('----------------------------------------');

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Username',
      credentials: {
        username: { label: 'Username', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.username) {
          return null;
        }

        const user = await db.users.getByUsername(credentials.username);

        if (user) {
          return {
            id: user.id,
            name: user.displayName,
            email: user.username,
            image: user.photoUrl
          };
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session?.user) {
        return { ...token, ...session.user };
      }

      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;

        logger.debug('JWT token initialized', 'Auth:JWT', {
          userId: user.id
        });
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.image = token.picture;

        // Fetch fresh data from DB if needed, or rely on token
        const dbUser = await db.users.getById(token.id as string);
        if (dbUser) {
          session.user.name = dbUser.displayName;
          session.user.image = dbUser.photoUrl;
          session.user.username = dbUser.username;
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
