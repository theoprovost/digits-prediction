const { Pool } = require('pg')

db_client = new Pool({
    connectionString: process.env.DATABASE_URL,
    sslmode: process.env.NODE_ENV === "production" ? "require" : "disable"
})

module.exports = db_client