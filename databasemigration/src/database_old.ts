import mysql from 'mysql2/promise';

let connection: mysql.Connection;

export async function connect() {
    const { DB_HOST, DB_USER, DB_PASS } = process.env;
    
    connection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: "unfall"
    });
}

export async function checkConnection() {
    if (!connection) await connect();
    try {
        await connection.query('SELECT 1');
    } catch (e) {
        await connect();
    }
}

export async function getConnection() {
    await checkConnection();
    return connection;
}

export async function setup() {
    const conn = await getConnection();
    const queries = [
        `CREATE TABLE IF NOT EXISTS webhooks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            creator_id TEXT,
            url TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS crash_causes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cause TEXT,
            crash_count INT
        )`,
        `CREATE TABLE IF NOT EXISTS players (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name TEXT,
            crash_count INT
        )`,
        `CREATE TABLE IF NOT EXISTS crashes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            crash_id TEXT,
            player_id TEXT,
            crash_time TEXT,
            version TEXT,
            data LONGTEXT
        )`
    ];
    
    await Promise.all(queries.map(query => conn.query(query)));
}