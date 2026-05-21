const instance = 'https://api.cobalt.blackcat.sweeux.org/';
const url = 'https://www.youtube.com/watch?v=EBgHGSZVl10';

async function testDownload() {
    try {
        console.log("Fetching video info from Cobalt API...");
        const response = await fetch(instance, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                videoQuality: '1080',
                audioFormat: 'mp3',
                downloadMode: 'auto',
                filenameStyle: 'classic',
                youtubeVideoCodec: 'h264'
            })
        });
        
        const data = await response.json();
        console.log("Status:", data.status);
        console.log("Filename:", data.filename);
        console.log("Tunnel URL:", data.url ? data.url.substring(0, 50) + "..." : "none");
        
        if (data.url) {
            console.log("Fetching tunnel URL headers...");
            const { execSync } = require('child_process');
            const output = execSync(`curl -I -s "${data.url}"`).toString();
            console.log("Headers:\n", output);
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
testDownload();
