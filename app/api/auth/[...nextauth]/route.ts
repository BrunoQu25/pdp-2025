import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        },
      },
    }),
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
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const googleEmail = user.email!; // Email real de Google
        
        logger.info('Google sign-in attempt', 'Auth', { 
          googleEmail,
          googleUserId: user.id,
          googleName: user.name
        });
        
        // Verificar si este email ya está vinculado a un usuario
        const boundUserId = db.auth.getUserIdByEmail(googleEmail);
        
        if (boundUserId) {
          // El email ya está vinculado, usar ese usuario hardcodeado
          const boundUser = db.users.getById(boundUserId);
          if (boundUser) {
            // IMPORTANTE: Reemplazar el ID de Google con el ID hardcodeado
            user.id = boundUser.id;
            user.name = boundUser.displayName;
            user.email = googleEmail; // Mantener el email de Google
            user.image = boundUser.photoUrl;
            
            logger.info('✅ User logged in with bound email', 'Auth', { 
              googleEmail, 
              assignedUserId: boundUser.id, 
              username: boundUser.username,
              displayName: boundUser.displayName 
            });
          }
        } else {
          // Email no vinculado - mantener el ID de Google temporalmente
          // Se vinculará en el POST /api/auth/bind
          logger.warn('⚠️ New email login - pending binding', 'Auth', { 
            googleEmail,
            tempUserId: user.id 
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // Si es un sign-in nuevo, actualizar el token con los datos del usuario
      if (user) {
        token.id = user.id;
        token.googleEmail = user.email;
        
        logger.debug('JWT token updated from user', 'Auth:JWT', {
          userId: user.id,
          email: user.email,
          name: user.name
        });
      }
      
      // IMPORTANTE: Siempre verificar si hay binding y actualizar el token
      if (token.googleEmail && trigger === 'update') {
        const boundUserId = db.auth.getUserIdByEmail(token.googleEmail as string);
        if (boundUserId && token.id !== boundUserId) {
          token.id = boundUserId;
          logger.info('Token ID updated from binding', 'Auth:JWT', {
            googleEmail: token.googleEmail,
            newUserId: boundUserId
          });
        }
      }
      
      // Siempre obtener datos actualizados del usuario hardcodeado si existe
      if (token.id) {
        const dbUser = db.users.getById(token.id as string);
        if (dbUser) {
          token.name = dbUser.displayName;
          token.picture = dbUser.photoUrl;
          token.username = dbUser.username;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.googleEmail) {
        // Verificar binding actualizado
        const boundUserId = db.auth.getUserIdByEmail(token.googleEmail as string);
        const userId = boundUserId || token.id as string;
        
        // Obtener el usuario hardcodeado de la DB
        const dbUser = db.users.getById(userId);
        
        if (dbUser) {
          // IMPORTANTE: Usar SIEMPRE los datos del usuario hardcodeado
          session.user.id = dbUser.id;
          session.user.name = dbUser.displayName;
          session.user.email = token.googleEmail as string;
          session.user.image = dbUser.photoUrl;
          
          logger.debug('Session updated with hardcoded user', 'Auth:Session', {
            userId: dbUser.id,
            displayName: dbUser.displayName,
            bound: !!boundUserId
          });
        } else {
          // No hay usuario hardcodeado (pendiente de binding)
          session.user.id = token.id as string;
          session.user.name = token.name as string;
          session.user.email = token.googleEmail as string;
          
          logger.debug('Session with Google user (pending binding)', 'Auth:Session', {
            tempUserId: token.id,
            googleEmail: token.googleEmail
          });
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

