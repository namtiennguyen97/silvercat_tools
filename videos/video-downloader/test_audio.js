const instance = 'https://api.cobalt.blackcat.sweeux.org/';
const url = 'https://www.youtube.com/watch?v=EBgHGSZVl10';

async function testAudio() {
    try {
        const response = await fetch(instance, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                downloadMode: 'audio',
                audioFormat: 'mp3',
                filenameStyle: 'classic',
            })
        });
        const data = await response.json();
        console.log("Audio response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.log("Error:", e.message);
    }
}
testAudio();
