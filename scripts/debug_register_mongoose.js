const mongoose = require('mongoose');

// Mock helpers since we can't easily import ES modules in this script without package.json "type": "module"
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

// Handle model recompilation for the script
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
    try {
        console.log('Connecting to DB...');
        await dbConnect();
        console.log('Connected.');

        const email = `test_debug_${Date.now()}@example.com`;
        console.log('Attempting to create user:', email);

        const newUser = await User.create({
            name: 'Debug User',
            email: email,
            password: 'hashed_password_mock'
        });

        console.log('User created successfully:', newUser._id);

    } catch (error) {
        console.error('DEBUG SCRIPT ERROR:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
