const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(cors());

/* SQLite Database */
let db = new sqlite3.Database('./database/conway.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the Conway database.');
});

app.get('/hello', (req, res) => {
    db.all(`SELECT id, username FROM users`,
        [],
        (err, rows) => {
            if (err) {
                res.status(400).json(err.message);
            }

            res.status(200).json({...rows});
        });
});

// Respond with 404 to any routes not matching API endpoints
app.all('/*', (req, res) => {
    res.status(404).json('No endpoint exists at ' + req.originalUrl);
});

const server = app.listen(port, () => console.log(`Instagram app listening on port ${port}!`));

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('\nClose Conway database connection.');
        server.close();
        process.exit();
    });
});