import express from 'express';
import * as datacollector from '../modules/datacollector';

export async function frontEndData(request: express.Request, response: express.Response) {
    let last24h = datacollector.last24h;
    let last30d = datacollector.last30d;
    let causes = datacollector.causes;
    let versions = datacollector.verions;

    response.send({
        last24h: last24h,
        last30d: last30d,
        causes: causes,
        versions: versions
    });
}