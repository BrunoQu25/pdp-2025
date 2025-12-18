import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';

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

        const user = db.users.getByUsername(credentials.username);
        
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

