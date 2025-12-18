import { User, Drink, HARDCODED_USERS } from '@/types';
import { logger } from './logger';

// In-memory storage for demo (in production, use a real database)
let users: User[] = [...HARDCODED_USERS];
let drinks: Drink[] = [];
let emailToUserBindings: Map<string, string> = new Map(); // email -> userId

logger.info('Database initialized', 'DB', {
  userCount: users.length,
  drinksCount: drinks.length
});

export const db = {
  users: {
    getAll: (): User[] => users,
    getByUsername: (username: string): User | undefined => 
      users.find(u => u.username.toLowerCase() === username.toLowerCase()),
    getById: (id: string): User | undefined => 
      users.find(u => u.id === id),
    getByEmail: (email: string): User | undefined => 
      users.find(u => u.authorizedEmail?.toLowerCase() === email.toLowerCase()),
    updatePoints: (userId: string, points: number): User | undefined => {
      const user = users.find(u => u.id === userId);
      if (user) {
        user.points += points;
      }
      return user;
    }
  },
  auth: {
    // Obtener el userId asociado a un email
    getUserIdByEmail: (email: string): string | undefined => {
      return emailToUserBindings.get(email.toLowerCase());
    },
    // Verificar si un usuario ya está vinculado a algún email
    isUserBound: (userId: string): boolean => {
      return Array.from(emailToUserBindings.values()).includes(userId);
    },
    // Vincular un email a un usuario
    bindEmailToUser: (email: string, userId: string): boolean => {
      const normalizedEmail = email.toLowerCase();
      
      // Verificar si el email ya está vinculado
      if (emailToUserBindings.has(normalizedEmail)) {
        return false; // Email ya vinculado a otro usuario
      }
      
      // Verificar si el usuario ya está vinculado a otro email
      if (db.auth.isUserBound(userId)) {
        return false; // Usuario ya vinculado a otro email
      }
      
      emailToUserBindings.set(normalizedEmail, userId);
      logger.info('Email bound to user', 'DB:Auth', { email: normalizedEmail, userId });
      return true;
    },
    // Obtener el email vinculado a un usuario
    getEmailByUserId: (userId: string): string | undefined => {
      for (const [email, uid] of emailToUserBindings.entries()) {
        if (uid === userId) {
          return email;
        }
      }
      return undefined;
    },
    // Listar todos los bindings
    getAllBindings: (): Map<string, string> => {
      return new Map(emailToUserBindings);
    }
  },
  drinks: {
    getAll: (): Drink[] => drinks,
    getByUserId: (userId: string): Drink[] => 
      drinks.filter(d => d.userId === userId),
    getById: (drinkId: string): Drink | undefined =>
      drinks.find(d => d.id === drinkId),
    add: (drink: Omit<Drink, 'id'>): Drink => {
      const newDrink: Drink = {
        ...drink,
        id: `drink-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      drinks.push(newDrink);
      return newDrink;
    },
    vote: (drinkId: string, voterId: string): { drink: Drink | undefined; deleted: boolean } => {
      const drink = drinks.find(d => d.id === drinkId);
      if (!drink || drink.deleted) {
        logger.debug('Vote rejected - drink not found or already deleted', 'DB:Vote', { drinkId });
        return { drink, deleted: false };
      }

      // Check if user already voted
      if (drink.votes.includes(voterId)) {
        logger.debug('Vote rejected - user already voted', 'DB:Vote', { drinkId, voterId });
        return { drink, deleted: false };
      }

      // Add vote
      drink.votes.push(voterId);
      logger.debug('Vote added', 'DB:Vote', { 
        drinkId, 
        voterId, 
        voteCount: drink.votes.length 
      });

      // Check if should be deleted (>10 votes)
      if (drink.votes.length > 10 && !drink.deleted) {
        drink.deleted = true;
        drink.deletedAt = new Date();
        // Remove points from user
        db.users.updatePoints(drink.userId, -drink.points);
        
        logger.warn('🚨 Drink deleted by community vote', 'DB:Vote', {
          drinkId,
          userId: drink.userId,
          username: drink.username,
          voteCount: drink.votes.length,
          pointsDeducted: drink.points
        });
        
        return { drink, deleted: true };
      }

      return { drink, deleted: false };
    }
  },
  reset: () => {
    users = [...HARDCODED_USERS];
    drinks = [];
    emailToUserBindings.clear();
  }
};

