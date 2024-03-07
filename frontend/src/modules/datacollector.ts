let last30d = [];

import * as db from './database';

export async function calculateData() {
    console.log(await calculate24h());
}


async function calculate24h() {
    const conn = await db.getConnection();
    // @ts-ignore

    // Get current time in ISO 8601 format
    const currentTime = new Date().toISOString();

    // Calculate the time 24 hours ago in ISO 8601 format
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Query to get the count of crashes for each hour in the last 24 hours
    const query = `
        SELECT 
            DATE_FORMAT(crash_time, '%Y-%m-%d %H:00:00') AS hour, 
            COUNT(*) AS crash_count
        FROM 
            crashes
        WHERE 
            crash_time >= '${twentyFourHoursAgo}' AND
            crash_time <= '${currentTime}'
        GROUP BY 
            hour
        ORDER BY 
            hour;
    `;

    // Execute the query
    const result = await conn.query(query);

    // Initialize an array to store results for the last 24 hours
    const last24h: { hour: string, crash_count: number }[] = [];

    // Initialize an object to store counts for each hour
    const counts: { [hour: string]: number } = {};

    // Fill the counts object with crash counts from the result
    result.forEach((row: any) => {
        counts[row.hour] = row.crash_count;
    });

    // Fill the last24h array with 0s for each hour if there are no crashes recorded
    const currentHour = new Date().getUTCHours();
    for (let i = 0; i < 24; i++) {
        const hour = new Date(Date.now() - (currentHour - i) * 60 * 60 * 1000).toISOString().slice(0, 13) + ':00:00';
        const crash_count = counts[hour] || 0;
        last24h.push({ hour, crash_count });
    }

    // Return the array with crash counts for the last 24 hours
    return last24h;
}



