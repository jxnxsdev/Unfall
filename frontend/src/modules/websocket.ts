import ws from 'ws';

let client: ws;

export async function connect() {
    client = new ws('ws://localhost:1404');

    client.on('open', () => {
        console.log('Connected to websocket server!');
    });

    client.on('message', (data) => {
        handleMessage(data.toString());
    });

    client.on('close', () => {
        console.log('Disconnected from websocket server!');
        setTimeout(connect, 1000);
    });

    client.on('error', (err) => {
        process.exit(1);
    });
}


async function handleMessage(message: string) {
    let json = JSON.parse(message);
    if (json.type === "crash") {
        let crash = json.data;
        console.log("Received crash " + crash.crash_id);
        
    }
}