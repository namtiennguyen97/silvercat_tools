const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const instance = 'https://dog.kittycat.boo/';

async function test() {
    try {
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
                filenameStyle: 'basic',
                youtubeVideoCodec: 'h264'
            })
        });
        const data = await response.json();
        console.log("Cobalt Data:", data);

        if (data.url) {
            console.log("Fetching tunnel URL...");
            // Use node-fetch to simulate browser fetch
            const tunnelRes = await fetch(data.url);
            console.log("Tunnel Headers:", tunnelRes.headers);
            console.log("Tunnel Status:", tunnelRes.status);
            
            // Read first few bytes
            const buffer = await tunnelRes.arrayBuffer();
            console.log("Buffer size:", buffer.byteLength);
            const view = new Uint8Array(buffer.slice(0, 50));
            console.log("First bytes:", Array.from(view).map(b => b.toString(16).padStart(2, '0')).join(' '));
            console.log("As string:", new TextDecoder().decode(view));
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
test();
