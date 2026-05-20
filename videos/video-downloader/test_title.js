const url = "https://www.youtube.com/watch?v=Kz6E1X53y6Y"; // Example video
const instance = 'https://api.cobalt.blackcat.sweeux.org/';

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
                youtubeVideoCodec: 'h264'
            })
        });
        const data = await response.json();
        console.log("Cobalt Data:", data);
    } catch (e) {
        console.log("Error:", e.message);
    }
}
test();
