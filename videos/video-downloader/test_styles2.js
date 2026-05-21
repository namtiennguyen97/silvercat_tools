const instance = 'https://api.cobalt.blackcat.sweeux.org/';
const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // We just need ANY video to see the style formats

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
                filenameStyle: style,
            })
        });
        const data = await response.json();
        console.log(`Style: ${style} -> filename: ${data.filename}`);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

async function run() {
    await testStyle('basic');
    await testStyle('classic');
    await testStyle('pretty');
    await testStyle('nerdy');
}
run();
