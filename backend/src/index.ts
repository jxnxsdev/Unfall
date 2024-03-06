import dotenv from 'dotenv';
import * as db from './modules/database';
import * as websocket from './modules/websocket';
import * as dataPuller from './modules/datapuller';
dotenv.config();

async function main() {
    console.log("Initializing Unfall Backend...");
    await db.connect();
    await websocket.start();
    await dataPuller.start();
    console.log("Unfall Backend initialized!");
}

main();