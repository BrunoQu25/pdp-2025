import { User, Drink, HARDCODED_USERS } from '@/types';
import prisma from './prisma';
import { logger } from './logger';

// Helper to map DB Drink to App Drink type
const mapDrink = (dbDrink: any): Drink => ({
  ...dbDrink,
  votes: dbDrink.votes ? dbDrink.votes.map((v: any) => v.userId) : [],
});

export const db = {
  getUserById: async (id: string): Promise<User | undefined> => {
    const user = await prisma.user.findUnique({ where: { id } });
    return user || undefined;
  },

  users: {
    getAll: async (): Promise<User[]> => {
      const users = await prisma.user.findMany({
        orderBy: { points: 'desc' }
      });
      return users;
    },
    getByUsername: async (username: string): Promise<User | undefined> => {
      const user = await prisma.user.findUnique({ where: { username } });
      return user || undefined;
    },
    getById: async (id: string): Promise<User | undefined> => {
      const user = await prisma.user.findUnique({ where: { id } });
      return user || undefined;
    },
    getByEmail: async (email: string): Promise<User | undefined> => {
      // Searching by authorizedEmail directly
      const user = await prisma.user.findFirst({
        where: { authorizedEmail: { equals: email, mode: 'insensitive' } }
      });
      return user || undefined;
    },
    updatePoints: async (userId: string, points: number): Promise<User | undefined> => {
      try {
        const user = await prisma.user.update({
          where: { id: userId },
          data: { points: { increment: points } }
        });
        return user;
      } catch (e) {
        logger.error('Failed to update points', 'DB', { userId, error: e });
        return undefined;
      }
    }
  },

  auth: {
    // Obtener el userId asociado a un email (via EmailBinding)
    getUserIdByEmail: async (email: string): Promise<string | undefined> => {
      const binding = await prisma.emailBinding.findUnique({
        where: { email: email.toLowerCase() }
      });
      return binding?.userId;
    },
    // Verificar si un usuario ya está vinculado a algún email
    isUserBound: async (userId: string): Promise<boolean> => {
      const count = await prisma.emailBinding.count({
        where: { userId }
      });
      return count > 0;
    },
    // Vincular un email a un usuario
    bindEmailToUser: async (email: string, userId: string): Promise<boolean> => {
      const normalizedEmail = email.toLowerCase();
      try {
        // Verificar si email ya existe es manejado por constraint @unique
        // Verificar si usuario ya tiene binding
        const existingUserBinding = await prisma.emailBinding.findFirst({
          where: { userId }
        });

        if (existingUserBinding) return false;

        await prisma.emailBinding.create({
          data: {
            email: normalizedEmail,
            userId
          }
        });
        logger.info('Email bound to user', 'DB:Auth', { email: normalizedEmail, userId });
        return true;
      } catch (e) {
        logger.error('Failed to bind email', 'DB', { email, userId, error: e });
        return false;
      }
    },
    // Obtener el email vinculado a un usuario
    getEmailByUserId: async (userId: string): Promise<string | undefined> => {
      const binding = await prisma.emailBinding.findFirst({
        where: { userId }
      });
      return binding?.email;
    },
    // Listar todos los bindings
    getAllBindings: async (): Promise<Map<string, string>> => {
      const bindings = await prisma.emailBinding.findMany();
      const map = new Map<string, string>();
      bindings.forEach((b: any) => map.set(b.email, b.userId));
      return map;
    },
    // PIN management
    setPinForUser: async (userId: string, pin: string): Promise<boolean> => {
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        return false;
      }
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { pin }
        });
        logger.info('PIN set for user', 'DB:Auth', { userId });
        return true;
      } catch (e) {
        return false;
      }
    },
    verifyPin: async (userId: string, pin: string): Promise<boolean> => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pin: true }
      });
      return user?.pin === pin;
    },
    hasPin: async (userId: string): Promise<boolean> => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pin: true }
      });
      return !!user?.pin;
    },
    getAllPins: async (): Promise<Map<string, string>> => {
      // Security risk? keeping implementation for compatibility but usage should be careful
      const users = await prisma.user.findMany({
        where: { pin: { not: null } },
        select: { id: true, pin: true }
      });
      const map = new Map<string, string>();
      users.forEach((u: any) => {
        if (u.pin) map.set(u.id, u.pin);
      });
      return map;
    },
    deletePinForUser: async (userId: string): Promise<boolean> => {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { pin: null }
        });
        logger.info('PIN deleted for user', 'DB:Auth', { userId });
        return true;
      } catch {
        return false;
      }
    }
  },

  drinks: {
    getAll: async (): Promise<Drink[]> => {
      const drinks = await prisma.drink.findMany({
        include: { votes: true },
        orderBy: { timestamp: 'desc' }
      });
      return drinks.map(mapDrink);
    },
    getByUserId: async (userId: string): Promise<Drink[]> => {
      const drinks = await prisma.drink.findMany({
        where: { userId },
        include: { votes: true },
        orderBy: { timestamp: 'desc' }
      });
      return drinks.map(mapDrink);
    },
    getById: async (drinkId: string): Promise<Drink | undefined> => {
      const drink = await prisma.drink.findUnique({
        where: { id: drinkId },
        include: { votes: true }
      });
      return drink ? mapDrink(drink) : undefined;
    },
    add: async (drink: Omit<Drink, 'id'>): Promise<Drink> => {
      const newDrink = await prisma.drink.create({
        data: {
          id: `drink-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: drink.userId,
          username: drink.username,
          size: drink.size,
          points: drink.points,
          photoUrl: drink.photoUrl,
          deleted: drink.deleted,
          votes: { create: [] } // Init empty votes
        },
        include: { votes: true }
      });
      return mapDrink(newDrink);
    },
    vote: async (drinkId: string, voterId: string): Promise<{ drink: Drink | undefined; deleted: boolean }> => {
      const drink = await prisma.drink.findUnique({
        where: { id: drinkId },
        include: { votes: true }
      });

      if (!drink || drink.deleted) {
        return { drink: drink ? mapDrink(drink) : undefined, deleted: false };
      }

      // Check if user already voted
      if (drink.votes.some((v: any) => v.userId === voterId)) {
        return { drink: mapDrink(drink), deleted: false };
      }

      // Add vote transaction
      // We need to add vote, and check count
      const updatedDrink = await prisma.$transaction(async (tx: any) => {
        // Create vote
        await tx.vote.create({
          data: {
            drinkId,
            userId: voterId
          }
        });

        // Get fresh drink data
        const freshDrink = await tx.drink.findUnique({
          where: { id: drinkId },
          include: { votes: true }
        });

        if (!freshDrink) throw new Error('Drink disappeared');

        // Check threshold
        if (freshDrink.votes.length > 9) {
          // Delete logic
          const user = await tx.user.findUnique({ where: { id: freshDrink.userId } });
          if (user) {
            await tx.user.update({
              where: { id: freshDrink.userId },
              data: { points: { decrement: freshDrink.points } }
            });
          }

          return await tx.drink.update({
            where: { id: drinkId },
            data: {
              deleted: true,
              deletedAt: new Date()
            },
            include: { votes: true }
          });
        }

        return freshDrink;
      });

      logger.debug('Vote processed', 'DB:Vote', {
        drinkId,
        voterId,
        deleted: updatedDrink.deleted
      });

      return { drink: mapDrink(updatedDrink), deleted: updatedDrink.deleted };
    }
  },

  reset: async () => {
    // For debugging/dev mostly - truncating likely restricted in prod envs
    // Not implementing full truncate for safety, or implement if truly needed
    logger.warn('Reset called but disabled in Prisma implementation for safety', 'DB');
  }
};

