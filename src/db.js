const { Pool } = require('pg');
const config = require('config');

const pool = new Pool({
    max: 20,
    host: config.get('db.pg_host'),
    port: config.get('db.pg_port'),
    user: config.get('db.pg_user'),
    password: config.get('db.pg_password'),
    database: config.get('db.pg_database'),
    idleTimeoutMillis: 30000
});

module.exports = pool;