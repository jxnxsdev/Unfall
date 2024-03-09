import * as dataTypes from '../datatypes';
import * as db from '../modules/database';

export async function addCrashReport(crash: dataTypes.processed_crash) {
    const conn = await db.getConnection();
    const { crash_id, player_id, crash_time, version, data } = crash;
    await conn.query('INSERT INTO crashes (crash_id, player_id, crash_time, version, data) VALUES (?, ?, ?, ?, ?)', [crash_id, player_id, crash_time, version, data]).catch(console.error);
    // @ts-ignore
    const [rows, fields] = await conn.query('SELECT * FROM players WHERE name = ?', [player_id]).catch(console.error);
    // @ts-ignore
    if (rows.length === 0) {
        await conn.query('INSERT INTO players (name, crash_count) VALUES (?, ?)', [player_id, 1]).catch(console.error);
    } else {
        await conn.query('UPDATE players SET crash_count = crash_count + 1 WHERE name = ?', [player_id]).catch(console.error);
    }

    const causes = JSON.parse(data).causes;

    for (const cause of causes) {
        if (cause === "") continue;
        if (!cause.toLowerCase().startsWith("lib")) continue;
        // @ts-ignore
        const [rows, fields] = await conn.query('SELECT * FROM crash_causes WHERE cause = ?', [cause]).catch(console.error);
        // @ts-ignore
        if (rows.length === 0) {
            await conn.query('INSERT INTO crash_causes (cause, crash_count) VALUES (?, ?)', [cause, 1]).catch(console.error);
        } else {
            await conn.query('UPDATE crash_causes SET crash_count = crash_count + 1 WHERE cause = ?', [cause]).catch(console.error);
        }
    }

    // @ts-ignore
    const [rows2, fields2] = await conn.query('SELECT * FROM version_crashes WHERE version = ?', [version]).catch(console.error);
    // @ts-ignore
    if (rows2.length === 0) {
        await conn.query('INSERT INTO version_crashes (version, crash_count) VALUES (?, ?)', [version, 1]).catch(console.error);
    } else {
        await conn.query('UPDATE version_crashes SET crash_count = crash_count + 1 WHERE version = ?', [version]).catch(console.error);
    }
}