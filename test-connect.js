
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing connection...');
        await prisma.$connect();
        console.log('Connection successful!');
        await prisma.$disconnect();
    } catch (e) {
        console.error('Connection failed:', e);
        process.exit(1);
    }
}

main();
