import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'btb1u63zpcchofpv5qww-mysql.services.clever-cloud.com',
    user: 'uchecfdzdlwyu01s',
    database: 'btb1u63zpcchofpv5qww',
    port: 3306,
    password: 'KU0ak7svKO3QoKbl6Zx0'
});

async function getConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("Database connection successful!")
        return connection
    } catch (err) {
        console.log("Database connection failed:", err);
        throw err;
    }
}

export { pool } //Se exporta el pool por si se necesita en una operación especifica