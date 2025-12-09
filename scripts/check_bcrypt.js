const bcrypt = require('bcryptjs');

async function check() {
    try {
        console.log('Hashing...');
        const hash = await bcrypt.hash('test', 10);
        console.log('Hash:', hash);
        console.log('Comparing...');
        const valid = await bcrypt.compare('test', hash);
        console.log('Valid:', valid);
    } catch (e) {
        console.error('Bcrypt failed:', e);
    }
}

check();
