import express from 'express';
import * as datacollector from '../modules/datacollector';

export async function playersData(request: express.Request, response: express.Response) {
    let players = datacollector.players;

    const { amount, after } = request.query;

    if (amount && after) {
        const amountNum = parseInt(amount as string);
        const afterNum = parseInt(after as string);
        const filteredPlayers = players.slice(afterNum, afterNum + amountNum);
        return response.json(filteredPlayers);
    }

    if (amount) {
        const amountNum = parseInt(amount as string);
        const limitedPlayers = players.slice(0, amountNum);
        return response.json(limitedPlayers);
    }

    if (after) {
        const afterNum = parseInt(after as string);
        const filteredPlayers = players.slice(afterNum);
        return response.json(filteredPlayers);
    }

    return response.json(players);
}
