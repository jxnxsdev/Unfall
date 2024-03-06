import axios from 'axios';
import * as cache from '../systemcache'
import { analyze_log } from './loganalyzer';
import * as db from './database';
import * as db_utils from '../utils/datautils';
import * as dataTypes from '../datatypes';

export async function start() {
    console.log("Initializing Unfall Data Puller...");
    setInterval(async () => {
        await pullData().catch(console.error);
    }, 1000 * 60 * 5);
    pullData().catch(console.error);
}


async function pullData() {
    await cache.set_last_pull_unix(Date.now());
    const crashes = await get_new();

    for (const crash of crashes) {
        const conn = await db.getConnection();
        // @ts-ignore
        const [rows, fields] = await conn.query('SELECT * FROM crashes WHERE crash_id = ?', [crash.crashId]).catch(console.error);
        // @ts-ignore
        if (rows.length > 0) {
            console.log("Crash " + crash.crashId + " already exists in database, returning.");
            return;
        }

        if (cache.current_pulls.includes(crash.crashId)) {
            console.log("Crash is already being processed, skipping.");
            continue;
        }

        cache.add_pull(crash.crashId);

        let userID = crash.userId;
        let crashID = crash.crashId;
        let uploadDate = crash.uploadDate;
        let gameVersion = crash.gameVersion || "Unknown";

        let log = await pull_log(crashID);
        let mods = log.mods || [];
        let header = log.header || "";
        let backtrace = log.backtrace || "";

        let cause = await analyze_log(backtrace);


        let data: dataTypes.data = {
            mods: mods,
            header: header,
            backtrace: backtrace,
            causes: cause
        };

        let processed_crash: dataTypes.processed_crash = {
            crash_id: crashID,
            player_id: userID,
            crash_time: uploadDate,
            version: gameVersion,
            data: JSON.stringify(data)
        };

        await db_utils.addCrashReport(processed_crash);
        cache.remove_pull(crashID);
        console.log("Processed crash " + crashID);
    }

}


async function get_new() {
    const url = process.env.API_URL;
    let res = await axios.get(url).catch((e) => {
        console.error(e);
        return { data: [] };
    });
    console.log("Pulled " + res.data.length + " crashes.");
    return res.data;
}

async function pull_log(crash_id: string) {
    const url = process.env.API_URL + "/" + crash_id;
    let res = await axios.get(url).catch((e) => {
        console.error(e);
        return { data: {} };
    });
    return res.data;
}