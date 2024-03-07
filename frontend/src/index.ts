import express from 'express';
import dotenv from 'dotenv';
import * as db from './modules/database';
import * as websocket from './modules/websocket';
import { handleApi } from './api/api';
import path from 'path';
import { calculateData } from './modules/datacollector';
dotenv.config();

const app = express();
app.use(express.json());

app.get('/api/*', (req, res) => {
    handleApi(req, res).catch((e) => {
        console.error(e);
        res.status(500).send("Internal server error");
    });
});

app.use(express.static(path.join(__dirname, '../web')));

app.listen(3005, async () => {
    await db.connect();
    await websocket.connect();
    console.log("Unfall Backend initialized!");
    calculateData();
});