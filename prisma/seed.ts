
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const HARDCODED_USERS = [
    {
        id: '1',
        username: 'Brux',
        displayName: 'Brux',
        photoUrl: 'avatar-brux.jpg',
        points: 0,
        authorizedEmail: 'brunoesbolso2001@gmail.com'
    },
    {
        id: '2',
        username: 'Gordo',
        displayName: 'Gordo',
        photoUrl: 'avatar-gordo.jpg',
        points: 0,
        authorizedEmail: 'gordo@example.com'
    },
    {
        id: '3',
        username: 'Fela',
        displayName: 'Fela',
        photoUrl: 'avatar-fela.jpg',
        points: 0,
        authorizedEmail: 'fela@example.com'
    },
    {
        id: '4',
        username: 'Loca',
        displayName: 'Loca',
        photoUrl: 'avatar-loca.jpg',
        points: 0,
        authorizedEmail: 'loca@example.com'
    },
    {
        id: '5',
        username: 'Nachein',
        displayName: 'Nachein',
        photoUrl: 'avatar-nachein.jpg',
        points: 0,
        authorizedEmail: 'nachein@example.com'
    },
    {
        id: '6',
        username: 'Andi',
        displayName: 'Andi',
        photoUrl: 'avatar-andi.jpg',
        points: 0,
        authorizedEmail: 'andi@example.com'
    },
    {
        id: '7',
        username: 'Aguslo',
        displayName: 'Aguslo',
        photoUrl: 'avatar-aguslo.jpg',
        points: 0,
        authorizedEmail: 'aguslo@example.com'
    },
    {
        id: '8',
        username: 'Octo',
        displayName: 'Octo',
        photoUrl: 'avatar-octo.jpg',
        points: 0,
        authorizedEmail: 'octo@example.com'
    },
    {
        id: '9',
        username: 'Casti',
        displayName: 'Casti',
        photoUrl: 'avatar-casti.jpg',
        points: 0,
        authorizedEmail: 'casti@example.com'
    },
    {
        id: '10',
        username: 'Juanmalore',
        displayName: 'Juanmalore',
        photoUrl: 'avatar-juanmalore.jpg',
        points: 0,
        authorizedEmail: 'juanmalore@example.com'
    },
    {
        id: '11',
        username: 'Harry',
        displayName: 'Harry',
        photoUrl: 'avatar-harry.jpg',
        points: 0,
        authorizedEmail: 'harry@example.com'
    },
    {
        id: '12',
        username: 'Nicofer',
        displayName: 'Nicofer',
        photoUrl: 'avatar-nicofer.jpg',
        points: 0,
        authorizedEmail: 'nicofer@example.com'
    },
    {
        id: '13',
        username: 'Sopa',
        displayName: 'Sopa',
        photoUrl: 'avatar-sopa.jpg',
        points: 0,
        authorizedEmail: 'sopa@example.com'
    },
    {
        id: '14',
        username: 'Krugi',
        displayName: 'Krugi',
        photoUrl: 'avatar-krugi.jpg',
        points: 0,
        authorizedEmail: 'krugi@example.com'
    },
    {
        id: '15',
        username: 'Bri',
        displayName: 'Bri',
        photoUrl: 'avatar-bri.jpg',
        points: 0,
        authorizedEmail: 'bri@example.com'
    },
    {
        id: '16',
        username: 'Gabo',
        displayName: 'Gabo',
        photoUrl: 'avatar-gabo.jpg',
        points: 0,
        authorizedEmail: 'gabo@example.com'
    },
    {
        id: '17',
        username: 'Tincho',
        displayName: 'Tincho',
        photoUrl: 'avatar-tincho.jpg',
        points: 0,
        authorizedEmail: 'tincho@example.com'
    },
    {
        id: '18',
        username: 'Dyzer',
        displayName: 'Dyzer',
        photoUrl: 'avatar-dyzer.jpg',
        points: 0,
        authorizedEmail: 'dyzer@example.com'
    }
];

// Datos de ejemplo para bebidas
const SAMPLE_DRINKS = [
    {
        id: 'drink-sample-1',
        userId: '1', // Brux
        username: 'Brux',
        size: 'Cervecita',
        points: 1,
        photoUrl: 'placeholder-drink.jpg',
        timestamp: new Date('2025-01-15T20:00:00Z')
    },
    {
        id: 'drink-sample-2',
        userId: '2', // Gordo
        username: 'Gordo',
        size: 'Cerveza',
        points: 2,
        photoUrl: 'placeholder-drink.jpg',
        timestamp: new Date('2025-01-15T20:15:00Z')
    },
    {
        id: 'drink-sample-3',
        userId: '3', // Fela
        username: 'Fela',
        size: 'Trago',
        points: 2,
        photoUrl: 'placeholder-drink.jpg',
        timestamp: new Date('2025-01-15T20:30:00Z')
    },
    {
        id: 'drink-sample-4',
        userId: '4', // Loca
        username: 'Loca',
        size: 'Caipi/Daiki',
        points: 1.5,
        photoUrl: 'placeholder-drink.jpg',
        timestamp: new Date('2025-01-15T20:45:00Z')
    },
    {
        id: 'drink-sample-5',
        userId: '5', // Nachein
        username: 'Nachein',
        size: 'Loca Shot',
        points: 3,
        photoUrl: 'placeholder-drink.jpg',
        timestamp: new Date('2025-01-15T21:00:00Z')
    },
    {
        id: 'drink-sample-6',
        userId: '1', // Brux - segunda bebida
        username: 'Brux',
        size: 'Triple Loca Shot',
        points: 12,
        photoUrl: 'placeholder-drink.jpg',
        timestamp: new Date('2025-01-15T21:30:00Z')
    }
];

// Votos de ejemplo
const SAMPLE_VOTES = [
    { drinkId: 'drink-sample-2', userId: '1' },  // Brux vota contra Gordo
    { drinkId: 'drink-sample-2', userId: '3' },  // Fela vota contra Gordo
    { drinkId: 'drink-sample-3', userId: '2' },  // Gordo vota contra Fela
    { drinkId: 'drink-sample-4', userId: '1' },  // Brux vota contra Loca
    { drinkId: 'drink-sample-4', userId: '5' },  // Nachein vota contra Loca
    { drinkId: 'drink-sample-5', userId: '1' },  // Brux vota contra Nachein
    { drinkId: 'drink-sample-5', userId: '2' },  // Gordo vota contra Nachein
    { drinkId: 'drink-sample-5', userId: '3' },  // Fela vota contra Nachein
    { drinkId: 'drink-sample-5', userId: '4' },  // Loca vota contra Nachein
    { drinkId: 'drink-sample-5', userId: '6' },  // Andi vota contra Nachein (más de 9 votos)
    { drinkId: 'drink-sample-6', userId: '2' },  // Gordo vota contra Brux
];

async function main() {
    console.log('🗃️ Starting database initialization...')

    // 1. Crear/actualizar usuarios
    console.log('👥 Creating users...')
    for (const user of HARDCODED_USERS) {
        const upsertedUser = await prisma.user.upsert({
            where: { username: user.username },
            update: {
                displayName: user.displayName,
                photoUrl: user.photoUrl,
                authorizedEmail: user.authorizedEmail,
            },
            create: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                photoUrl: user.photoUrl,
                points: user.points,
                authorizedEmail: user.authorizedEmail
            },
        })
        console.log(`✅ Upserted user: ${upsertedUser.username} (${upsertedUser.id})`)
    }

    // 2. Crear vinculaciones de email para algunos usuarios
    console.log('📧 Creating email bindings...')
    const emailBindings = [
        { email: 'brunoesbolso2001@gmail.com', userId: '1' }, // Brux
        { email: 'gordo@example.com', userId: '2' }, // Gordo
        { email: 'fela@example.com', userId: '3' }, // Fela
    ];

    for (const binding of emailBindings) {
        const upsertedBinding = await prisma.emailBinding.upsert({
            where: { email: binding.email },
            update: { userId: binding.userId },
            create: binding,
        });
        console.log(`✅ Created email binding: ${binding.email} -> ${binding.userId}`);
    }

    console.log('🎉 Database initialization completed successfully!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
