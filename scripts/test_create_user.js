const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing User Creation with directConnection...');
        const email = `test_${Date.now()}@example.com`;
        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: email,
                password: 'hashedpassword123'
            }
        });
        console.log('SUCCESS! User created:', user.id);
    } catch (e) {
        console.error('FAILED:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
