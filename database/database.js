const { Pool } = require('pg')

if (process.env.NODE_ENV == 'production') {
    db_client = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    })

} else {
    db_client = new Pool({
        connectionString: process.env.DATABASE_URL
    })
}

module.exports = db_client