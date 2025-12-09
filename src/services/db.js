import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'interactions.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Initialize file if not exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

export function getInteractions() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading interactions DB:', error);
        return {};
    }
}

export function saveInteraction(url, type, data) {
    const db = getInteractions();

    if (!db[url]) {
        db[url] = { likes: 0, comments: [] };
    }

    if (type === 'like') {
        db[url].likes += 1;
    } else if (type === 'comment') {
        db[url].comments.push(data);
    }

    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        return db[url];
    } catch (error) {
        console.error('Error writing interactions DB:', error);
        return null;
    }
}
