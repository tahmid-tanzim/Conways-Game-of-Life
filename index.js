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

/**
 * Live Cell is `*`
 * Dead Cell is `.`
 * */

const cell = {LIVE: '*', DEAD: '.'};

const getStringFrom2DArray = ({x, y, data}) => {
    console.log(typeof data);
    return {x, y, data: [].concat.apply([], data).join()};
};

const get2DArrayFromString = ({x, y, data}) => {
    const dataArr = data.split(',');
    let data2DArray = [];

    while (dataArr.length) {
        data2DArray.push(dataArr.splice(0, x));
    }

    return {x, y, data: data2DArray};
};

/**
 * @position = {x, y}
 * @type is Live or Dead Neighbours?
 * */
const countNeighbours = (grid, position, type = cell.LIVE) => {
    const {x, y} = position;
    let counter = 0;
    for (let i = x - 1 < 0 ? 0 : x - 1; i <= x + 1; i++) {
        for (let j = y - 1 < 0 ? 0 : y - 1; j <= y + 1; j++) {
            if((i !== x || j !== y) && i < grid.x && j < grid.y) {
                const cellData = grid.data[i][j];
                if(cellData === type) {
                    counter++;
                }
            }
        }
    }

    return counter;
};

/**
 * @Conditions
 * 1. Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
 * 2. Any live cell with two or three live neighbours lives on to the next generation.
 * 3. Any live cell with more than three live neighbours dies, as if by overpopulation.
 * 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
 * */
const update = (originalGrid, updatedGridData, position, neighboursCount) => {
    const {x, y} = position;

    if(originalGrid.data[x][y] === cell.LIVE && (neighboursCount < 2 || neighboursCount > 3)) {
        updatedGridData[x][y] = cell.DEAD;
    }

    if(originalGrid.data[x][y] === cell.DEAD && neighboursCount === 3) {
        updatedGridData[x][y] = cell.LIVE;
    }

    return updatedGridData;
};

const age = (times) => {
    let originalGrid = get2DArrayFromString({x: 3, y: 3, data: '*,.,*,.,*,*,.,.,*'});

    // Deep copy
    let updatedGridData = originalGrid.data.map((arr) => arr.slice());
    let neighboursCount = 0;
    for (let i = 0; i < originalGrid.x; i++) {
        for (let j = 0; j < originalGrid.y; j++) {
            neighboursCount = countNeighbours(originalGrid, {x: i, y: j});
            console.log(`Positions: ${i} - ${j} ->`, neighboursCount);
            updatedGridData = update(originalGrid, updatedGridData, {x: i, y: j} ,neighboursCount);
        }
    }

    console.log(updatedGridData);
    console.log(originalGrid.data);
};

age();


// app.get('/hello', (req, res) => {
//     db.all(`SELECT id, username FROM users`,
//         [],
//         (err, rows) => {
//             if (err) {
//                 res.status(400).json(err.message);
//             }
//
//             res.status(200).json({...rows});
//         });
// });

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