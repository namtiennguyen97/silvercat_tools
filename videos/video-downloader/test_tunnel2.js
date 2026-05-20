const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
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
            })
        });
        const data = await response.json();
        
        if (data.url) {
            console.log("Fetching tunnel URL 1st time...");
            const t1 = await fetch(data.url);
            console.log("T1 Status:", t1.status, t1.headers.get('content-type'));
            
            console.log("Fetching tunnel URL 2nd time...");
            const t2 = await fetch(data.url);
            console.log("T2 Status:", t2.status, t2.headers.get('content-type'));
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
test();
