const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await prisma.$connect();
        console.log('Connected successfully!');

        console.log('Attempting to fetch users...');
        const count = await prisma.user.count();
        console.log(`User count: ${count}`);

    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
