import dotenv from 'dotenv';
import * as db from './database';
import * as db_old from './database_old';
import axios from 'axios';
import * as analyzer from './loganalyzer';
import * as dataTypes from './datatypes';
import { addCrashReport } from './add_crashreport';
dotenv.config();

async function startmigration() {
    console.log("Initializing Unfall Database Migration...");
    await db.connect();
    await db_old.connect();

    await migrate();
}

let current = 1;
let dbSize = 0;

async function migrate() {
    // get the size of the old database
    const conn = await db_old.getConnection();
    // @ts-ignore
    const [rows, fields] = await conn.query('SELECT COUNT(*) FROM CrashReports').catch(console.error);
    dbSize = rows[0]['COUNT(*)'];
    console.log("Old database size: " + dbSize);

    while (true) {
        await add(current);
        current++;
        if (current > dbSize) {
            break;
        }
    }
}

async function add(currentId: number) {
    let connection_old = await db_old.getConnection();
        // @ts-ignore
        const [rows, fields] = await connection_old.query('SELECT * FROM CrashReports WHERE crash_report_id = ?', [currentId]).catch(console.error);
        
        if (rows.length === 0) {
            console.log("Crash " + currentId + " does not exist in old database, returning.");
            return;
        }
        
        let id = rows[0].id;
        let username = rows[0].username;
        let report_date = rows[0].report_date;
        let version = rows[0].gameversion;

        // check of the crash report exists in the new database
        const conn = await db.getConnection();
        // @ts-ignore
        const [rows_new, fields_new] = await conn.query('SELECT * FROM crashes WHERE crash_id = ?', [id]).catch(console.error);
        // @ts-ignore
        if (rows_new.length > 0) {
            console.log("Processed crash " + id + " (" + currentId + "/" + dbSize + ")");
            return;
        }

        if (version === "undefined") {
            version = "Unknown";
        }

        // convert report_date from 2023-09-21 13:09:27 to 2024-03-07T17:15:28.605Z
        let report_date_converted = report_date;

        let log = await pull_log(id);
        let mods = log.mods || [];
        let header = log.header || "";
        let backtrace = log.backtrace || "";

        let cause = await analyzer.analyze_log(backtrace);

        let data: dataTypes.processed_crash = {
            crash_id: id,
            player_id: username,
            crash_time: report_date_converted,
            version: version,
            data: JSON.stringify({
                mods: mods,
                header: header,
                causes: cause
            })
        };

        await addCrashReport(data);
        console.log("Processed crash " + id + " (" + currentId + "/" + dbSize + ")");
}

async function pull_log(crash_id: string) {
    const url = process.env.API_URL + "/" + crash_id;
    let res = await axios.get(url).catch((e) => {
        console.error(e);
        return { data: {} };
    });
    return res.data;
}

startmigration()