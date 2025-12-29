import axios from 'axios';

async function testReddit() {
    try {
        console.log('Fetching Reddit...');
        const response = await axios.get('https://www.reddit.com/r/popular/top.json?limit=10&t=day', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const posts = response.data?.data?.children || [];
        console.log(`Found ${posts.length} posts.`);

        const trends = posts.map(post => post.data.title).slice(0, 5);
        console.log('Top 5:', trends);

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testReddit();
