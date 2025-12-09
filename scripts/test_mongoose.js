const mongoose = require('mongoose');

async function main() {
    try {
        console.log('Connecting via Mongoose...');
        await mongoose.connect('mongodb://127.0.0.1:27017/trending_news?directConnection=true');
        console.log('Connected!');

        const schema = new mongoose.Schema({ name: String });
        const User = mongoose.model('User_Mongoose_Test', schema);

        console.log('Creating user...');
        await User.create({ name: 'Test' });
        console.log('SUCCESS! Mongoose write worked.');

    } catch (e) {
        console.error('FAILED:', e);
    } finally {
        await mongoose.disconnect();
    }
}

main();
