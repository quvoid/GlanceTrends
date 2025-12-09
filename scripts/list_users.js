const mongoose = require('mongoose');

// Mock helpers
const MONGODB_URI = 'mongodb://127.0.0.1:27017/trending_news?directConnection=true';

async function dbConnect() {
    if (mongoose.connection.readyState >= 1) return;
    return mongoose.connect(MONGODB_URI);
}

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
    try {
        await dbConnect();
        console.log('Connected to DB.');

        const users = await User.find({}, { password: 0 }); // Exclude password
        console.log('--- REGISTERED USERS ---');
        console.table(users.map(u => ({
            id: u._id.toString(),
            name: u.name,
            email: u.email,
            created: u.createdAt
        })));
        console.log('------------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
