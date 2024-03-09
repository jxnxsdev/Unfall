import express from 'express';
import { frontEndData } from './frontpage';
import { playersData } from './players';


export async function handleApi(request: express.Request, response: express.Response) {
    const path = request.path;
    let args = path.split('/');
    args.shift();
    args.shift();

    switch (args[0]) {

        case "frontpage": {
            await frontEndData(request, response).catch((e) => {
                console.error(e);
                response.status(500).send("Internal server error");
            });
            break;
        }

        case "players": {
            await playersData(request, response).catch((e) => {
                console.error(e);
                response.status(500).send("Internal server error");
            });
            break;
        }

        default: {
            response.status(404).send("Not found");
            break;
        }
    }
}