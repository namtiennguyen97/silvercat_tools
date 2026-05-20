const instance = 'https://api.cobalt.blackcat.sweeux.org/';
const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

async function testStyle() {
    try {
        const response = await fetch(instance, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
            })
        });
        const data = await response.json();
        console.log("Tunnel:", data.url);
        
        // Let's do a curl to see headers
        const { execSync } = require('child_process');
        const output = execSync(`curl -I -s "${data.url}"`).toString();
        console.log("Headers:\n", output);

    } catch (e) {
        console.log("Error:", e.message);
    }
}
testStyle();
