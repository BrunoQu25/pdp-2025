import prisma from './prisma-client';
import { logger } from './logger';

logger.info('Database initialized', 'DB', {
    provider: 'PostgreSQL (Prisma)',
    environment: process.env.NODE_ENV
});

// Interfaz compatible con el código existente
export const db = {
    // User methods
    getUserById: async (id: string) => {
        return await prisma.user.findUnique({
            where: { id },
            include: {
                drinks: {
                    where: { deleted: false },
                    orderBy: { timestamp: 'desc' }
                }
            }
        });
    },

    users: {
        getAll: async () => {
            return await prisma.user.findMany({
                orderBy: { points: 'desc' }
            });
        },

        getByUsername: async (username: string) => {
            return await prisma.user.findUnique({
                where: { username }
            });
        },

        getById: async (id: string) => {
            return await prisma.user.findUnique({
                where: { id }
            });
        },

        getByEmail: async (email: string) => {
            return await prisma.user.findFirst({
                where: { authorizedEmail: email.toLowerCase() }
            });
        },

        updatePoints: async (userId: string, points: number) => {
            return await prisma.user.update({
                where: { id: userId },
                data: {
                    points: {
                        increment: points
                    }
                }
            });
        },

        create: async (data: {
            id: string;
            username: string;
            displayName: string;
            photoUrl: string;
            points?: number;
            authorizedEmail?: string;
            pin?: string;
        }) => {
            return await prisma.user.create({
                data: {
                    ...data,
                    points: data.points ?? 0
                }
            });
        }
    },

    auth: {
        // Obtener el userId asociado a un email
        getUserIdByEmail: async (email: string) => {
            const binding = await prisma.emailBinding.findUnique({
                where: { email: email.toLowerCase() }
            });
            return binding?.userId;
        },

        // Verificar si un usuario ya está vinculado a algún email
        isUserBound: async (userId: string) => {
            const binding = await prisma.emailBinding.findFirst({
                where: { userId }
            });
            return !!binding;
        },

        // Vincular un email a un usuario
        bindEmailToUser: async (email: string, userId: string) => {
            const normalizedEmail = email.toLowerCase();

            try {
                // Verificar si el email ya está vinculado
                const existingEmail = await prisma.emailBinding.findUnique({
                    where: { email: normalizedEmail }
                });
                if (existingEmail) {
                    return false;
                }

                // Verificar si el usuario ya está vinculado
                const existingUser = await prisma.emailBinding.findFirst({
                    where: { userId }
                });
                if (existingUser) {
                    return false;
                }

                // Crear binding
                await prisma.emailBinding.create({
                    data: {
                        email: normalizedEmail,
                        userId
                    }
                });

                logger.info('Email bound to user', 'DB:Auth', { email: normalizedEmail, userId });
                return true;
            } catch (error) {
                logger.error('Error binding email', 'DB:Auth', { error, email: normalizedEmail, userId });
                return false;
            }
        },

        // Obtener el email vinculado a un usuario
        getEmailByUserId: async (userId: string) => {
            const binding = await prisma.emailBinding.findFirst({
                where: { userId }
            });
            return binding?.email;
        },

        // Listar todos los bindings
        getAllBindings: async () => {
            const bindings = await prisma.emailBinding.findMany();
            const map = new Map<string, string>();
            bindings.forEach(b => map.set(b.email, b.userId));
            return map;
        },

        // PIN management
        setPinForUser: async (userId: string, pin: string) => {
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
            } catch (error) {
                logger.error('Error setting PIN', 'DB:Auth', { error, userId });
                return false;
            }
        },

        verifyPin: async (userId: string, pin: string) => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { pin: true }
            });
            return user?.pin === pin;
        },

        hasPin: async (userId: string) => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { pin: true }
            });
            return !!user?.pin;
        },

        getAllPins: async () => {
            const users = await prisma.user.findMany({
                where: { pin: { not: null } },
                select: { id: true, pin: true }
            });
            const map = new Map<string, string>();
            users.forEach(u => {
                if (u.pin) map.set(u.id, u.pin);
            });
            return map;
        },

        deletePinForUser: async (userId: string) => {
            try {
                await prisma.user.update({
                    where: { id: userId },
                    data: { pin: null }
                });
                logger.info('PIN deleted for user', 'DB:Auth', { userId });
                return true;
            } catch (error) {
                logger.error('Error deleting PIN', 'DB:Auth', { error, userId });
                return false;
            }
        }
    },

    drinks: {
        getAll: async () => {
            return await prisma.drink.findMany({
                where: { deleted: false },
                orderBy: { timestamp: 'desc' },
                include: {
                    votes: true
                }
            });
        },

        getByUserId: async (userId: string) => {
            return await prisma.drink.findMany({
                where: {
                    userId,
                    deleted: false
                },
                orderBy: { timestamp: 'desc' },
                include: {
                    votes: true
                }
            });
        },

        getById: async (drinkId: string) => {
            return await prisma.drink.findUnique({
                where: { id: drinkId },
                include: {
                    votes: true
                }
            });
        },

        add: async (drink: {
            userId: string;
            username: string;
            size: string;
            points: number;
            photoUrl: string;
        }) => {
            const newDrink = await prisma.drink.create({
                data: {
                    id: `drink-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    ...drink,
                    timestamp: new Date()
                },
                include: {
                    votes: true
                }
            });
            return newDrink;
        },

        vote: async (drinkId: string, voterId: string) => {
            try {
                // Obtener el drink con sus votos
                const drink = await prisma.drink.findUnique({
                    where: { id: drinkId },
                    include: { votes: true }
                });

                if (!drink || drink.deleted) {
                    logger.debug('Vote rejected - drink not found or already deleted', 'DB:Vote', { drinkId });
                    return { drink, deleted: false };
                }

                // Verificar si ya votó
                const existingVote = await prisma.vote.findUnique({
                    where: {
                        drinkId_userId: {
                            drinkId,
                            userId: voterId
                        }
                    }
                });

                if (existingVote) {
                    logger.debug('Vote rejected - user already voted', 'DB:Vote', { drinkId, voterId });
                    return { drink, deleted: false };
                }

                // Agregar voto
                await prisma.vote.create({
                    data: {
                        drinkId,
                        userId: voterId
                    }
                });

                // Obtener drink actualizado con votos
                const updatedDrink = await prisma.drink.findUnique({
                    where: { id: drinkId },
                    include: { votes: true }
                });

                if (!updatedDrink) {
                    return { drink: null, deleted: false };
                }

                logger.debug('Vote added', 'DB:Vote', {
                    drinkId,
                    voterId,
                    voteCount: updatedDrink.votes.length
                });

                // Verificar si debe eliminarse (>9 votos)
                if (updatedDrink.votes.length > 9 && !updatedDrink.deleted) {
                    // Marcar como eliminado
                    await prisma.drink.update({
                        where: { id: drinkId },
                        data: {
                            deleted: true,
                            deletedAt: new Date()
                        }
                    });

                    // Restar puntos al usuario
                    await prisma.user.update({
                        where: { id: updatedDrink.userId },
                        data: {
                            points: {
                                decrement: updatedDrink.points
                            }
                        }
                    });

                    logger.warn('🚨 Drink deleted by community vote', 'DB:Vote', {
                        drinkId,
                        userId: updatedDrink.userId,
                        username: updatedDrink.username,
                        voteCount: updatedDrink.votes.length,
                        pointsDeducted: updatedDrink.points
                    });

                    const finalDrink = await prisma.drink.findUnique({
                        where: { id: drinkId },
                        include: { votes: true }
                    });

                    return { drink: finalDrink, deleted: true };
                }

                return { drink: updatedDrink, deleted: false };
            } catch (error) {
                logger.error('Error voting', 'DB:Vote', { error, drinkId, voterId });
                throw error;
            }
        }
    },

    // Método para cerrar la conexión (útil en tests)
    disconnect: async () => {
        await prisma.$disconnect();
    }
};

// Graceful shutdown
if (typeof window === 'undefined') {
    process.on('beforeExit', async () => {
        await prisma.$disconnect();
    });
}

export { prisma };
