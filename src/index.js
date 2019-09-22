const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const {calculateAge} = require('./Util');

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

app.get('/grids/:id/after', (req, res) => {
    const id = parseInt(req.params.id);
    const age = req.query.age
        .split(',')
        .map((item) => parseInt(item, 10))
        .sort((a, b) => a - b);

    if (id) {
        db.all(`SELECT * FROM grids WHERE id = ?`,
            [id],
            (err, [rows]) => {
                if (err) {
                    res.status(400).json(err.message);
                } else if (typeof rows === 'undefined') {
                    res.status(404).json('No grids found with ID: ' + id);
                } else {
                    const {id, x, y, data} = rows;
                    const newData = calculateAge(age, {x, y, data});
                    res.status(200).json({id, x, y, data: newData});
                }
            });
    } else {
        res.status(400).json('Invalid Request');
    }
});

app.get('/grids/:id', (req, res) => {
    const {id} = req.params;
    if (id) {
        db.all(`SELECT * FROM grids WHERE id = ?`,
            [id],
            (err, [rows]) => {
                if (err) {
                    res.status(400).json(err.message);
                } else if (typeof rows === 'undefined') {
                    res.status(404).json('No grids found with ID: ' + id);
                } else {
                    res.status(200).json({...rows});
                }
            });
    } else {
        res.status(400).json('Invalid Request');
    }
});

app.post('/grids', (req, res) => {
    const {x, y, data} = req.body;
    db.run(`INSERT INTO grids (x, y, data) VALUES (?,?,?)`,
        [x, y, data],
        function (err) {
            if (err) {
                res.status(400).json(err.message);
            } else {
                db.all(`SELECT * FROM grids WHERE id = ?`,
                    [this.lastID],
                    (err, [rows]) => {
                        if (err) {
                            res.status(400).json(err.message);
                        } else {
                            res.status(200).json({...rows});
                        }
                    });
            }
        });
});

app.patch('/grids/:id', (req, res) => {
    const {id} = req.params;
    const {x, y, data} = req.body;
    db.run(`UPDATE grids SET x = ?, y = ?, data = ? WHERE id = ?`,
        [x, y, data, id],
        function (err) {
            if (err) {
                res.status(400).json(err.message);
            } else {
                res.status(200).json('Updated successfully. ID: ' + id);
            }
        });
});

// Respond with 404 to any routes not matching API endpoints
app.all('/*', (req, res) => {
    res.status(404).json('No endpoint exists at ' + req.originalUrl);
});

const server = app.listen(process.env.PORT || port, () => console.log(`Conway app listening on port ${port}!`));

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