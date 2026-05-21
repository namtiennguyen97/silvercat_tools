const instance = 'https://api.cobalt.blackcat.sweeux.org/';
const url = 'https://www.youtube.com/watch?v=F31oZ2Gf5xI';

async function testStyle(style) {
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
                filenameStyle: style,
                youtubeVideoCodec: 'h264'
            })
        });
        const data = await response.json();
        console.log(`Style: ${style} -> `, data);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

async function run() {
    await testStyle('basic');
    await testStyle('nerdy');
}
run();
