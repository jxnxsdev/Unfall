import mysql from 'mysql2/promise';

let connection: mysql.Connection;

export async function connect() {
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASS;
    const database = process.env.DB_NAME;

    connection = await mysql.createConnection({
        host,
        user,
        password,
        database
    });

    await setup();
}

export async function checkConnection() {
    if (!connection) {
        await connect();
        return true;
    }
    try {
        await connection.query('SELECT 1');
        return true;
    } catch (e) {
        await connect();
        return true;
    }
}

export async function getConnection() {
    if (!connection) {
        await connect();
    }
    return connection;
}

export async function setup() {
    const conn = await getConnection();
    await conn.query(`
        CREATE TABLE IF NOT EXISTS webhooks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            creator_id TEXT,
            url TEXT
        )
    `);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS crash_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type TEXT,
            data TEXT
        )
    `);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS players (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name TEXT,
            crash_count INT
        )
    `);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS crashes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            player_id INT,
            crash_time TEXT,
            version TEXT,
            data TEXT
        )
    `);
}