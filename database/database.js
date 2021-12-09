const { Pool } = require('pg')

db_client = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

module.exports = db_client