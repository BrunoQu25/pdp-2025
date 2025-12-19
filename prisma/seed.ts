
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

async function main() {
    console.log('Start seeding ...')
    for (const user of HARDCODED_USERS) {
        const upsertedUser = await prisma.user.upsert({
            where: { username: user.username },
            update: {
                // Update fields if they change in hardcoded list
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
        console.log(`Upserted user with id: ${upsertedUser.id}`)
    }
    console.log('Seeding finished.')
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
