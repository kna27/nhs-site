const { Pool } = require('pg');

const pool = new Pool({
    max: 20,
    host: process.env.PG_HOST,
    port: process.env.DG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    idleTimeoutMillis: 30000
});

module.exports = pool;