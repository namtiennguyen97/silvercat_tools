const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const instances = [
    'https://dog.kittycat.boo',
    'https://api.cobalt.blackcat.sweeux.org',
    'https://cobaltapi.kittycat.boo',
    'https://cobaltapi.squair.xyz'
];

async function test() {
    for (const instance of instances) {
        try {
            const endpoint = instance.replace(/\/$/, '') + '/';
            console.log("Testing:", endpoint);
            const response = await fetch(endpoint, {
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
                }),
                signal: AbortSignal.timeout(10000)
            });
            const text = await response.text();
            console.log("Response:", response.status, text);
        } catch (e) {
            console.log("Error:", e.message);
        }
    }
}
test();
