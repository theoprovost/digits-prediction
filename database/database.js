const { Pool } = require('pg')

db_client = new Pool({
    connectionString: process.env.DATABASE_URL,
})

module.exports = db_client