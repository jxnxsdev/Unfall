import ws from 'ws';

let server: ws.Server;

export async function start() {
    server = new ws.Server({ port: 8080 });
}

export async function broadcast(message: string) {
    server.clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
            client.send(message);
        }
    });
}