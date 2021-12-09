const dotenv = require('dotenv');
dotenv.config();

const express = require('express')

// Globally increase node's max memory usage :
// export NODE_OPTIONS=--max_old_space_size=4096

const app = express()
const router = require('./router')
const port = process.env.PORT || 5000

// Local static assets access
app.use(express.static(__dirname + '/assets'));

// Specify views directory and add ejs as the view engine for dynamic content
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.json({ limit: '50mb', extended: true }))
app.use(router)

app.listen(port, () => {
    console.log(`[LOCAL] Server is listening on http://localhost:${port}`)
});

// NB : DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process
process.on('unhandledRejection', (err) => {
    console.log('Interception d\'un rejet de promesse');
    console.error(err);
})