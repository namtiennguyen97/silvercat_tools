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
                url: 'https://www.facebook.com/watch/?v=123456789', // fake or generic url, I will find a real one if this fails
            })
        });
        const data = await response.json();
        console.log("Cobalt Data:", data);
    } catch (e) {
        console.log("Error:", e.message);
    }
}
test();
