
const fs = require('fs');
const path = require('path');

// Read .env.local manually since we don't have dotenv
const envPath = path.join(__dirname, '..', '.env.local');
let apiKey = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error('Could not read .env.local');
    process.exit(1);
}

if (!apiKey) {
    console.error('No API Key found in .env.local');
    process.exit(1);
}

console.log('Testing API Key...');

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) {
            console.error('API Error:', JSON.stringify(data.error, null, 2));
        } else {
            console.log('Models fetched successfully.');
            fs.writeFileSync('models.json', JSON.stringify(data, null, 2));
            console.log('Saved to models.json');
        }
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

listModels();
