import dotenv from 'dotenv';
import * as db from './modules/database';
import * as websocket from './modules/websocket';
dotenv.config();

async function main() {
    console.log("Initializing Unfall Backend...");
    await db.connect();
    await websocket.start();
}