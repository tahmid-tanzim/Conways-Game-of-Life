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

// const cell = {LIVE: '*', DEAD: '.'};
//
// const getStringFrom2DArray = (data) => [].concat.apply([], data).join('');
//
// const get2DArrayFromString = ({x, y, data}) => {
//     const dataArr = data.split('');
//     let data2DArray = [];
//
//     while (dataArr.length) {
//         data2DArray.push(dataArr.splice(0, x));
//     }
//
//     return {x, y, data: data2DArray};
// };
//
// /**
//  * @position = {x, y}
//  * @type is Live or Dead Neighbours?
//  * */
// const countNeighbours = (grid,position,type = cell.LIVE) => {
//     const {x, y} = position;
//     let counter = 0;
//     for (let i = x - 1 < 0 ? 0 : x - 1; i <= x + 1; i++) {
//         for (let j = y - 1 < 0 ? 0 : y - 1; j <= y + 1; j++) {
//             if ((i !== x || j !== y) && i < grid.x && j < grid.y) {
//                 const cellData = grid.data[i][j];
//                 if (cellData === type) {
//                     counter++;
//                 }
//             }
//         }
//     }
//
//     return counter;
// };
//
// /**
//  * @Conditions
//  * 1. Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
//  * 2. Any live cell with two or three live neighbours lives on to the next generation.
//  * 3. Any live cell with more than three live neighbours dies, as if by overpopulation.
//  * 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
//  * */
// const update = (originalGrid, updatedGridData, position, neighboursCount) => {
//     const {x, y} = position;
//
//     if (originalGrid.data[x][y] === cell.LIVE && (neighboursCount < 2 || neighboursCount > 3)) {
//         updatedGridData[x][y] = cell.DEAD;
//     }
//
//     if (originalGrid.data[x][y] === cell.DEAD && neighboursCount === 3) {
//         updatedGridData[x][y] = cell.LIVE;
//     }
//
//     return updatedGridData;
// };
//
// const calculateAge = (agesArray, grid) => {
//     const maxCount = Math.max(...agesArray);
//     // console.log('max count: ', maxCount);
//     let originalGrid = get2DArrayFromString(grid);
//     // Deep copy
//     let updatedGridData = originalGrid.data.map((arr) => arr.slice());
//     let count = 1, ages_index = 0, data = [];
//
//     while (count <= maxCount) {
//         // console.log(`-------- ${count} --------`);
//         let neighboursCount = 0;
//         for (let i = 0; i < originalGrid.x; i++) {
//             for (let j = 0; j < originalGrid.y; j++) {
//                 neighboursCount = countNeighbours(originalGrid, {x: i, y: j});
//                 // console.log(`Positions: ${i} - ${j} ->`, neighboursCount);
//                 updatedGridData = update(originalGrid, updatedGridData, {x: i, y: j}, neighboursCount);
//             }
//         }
//
//         // Store in data array
//         if (count === agesArray[ages_index]) {
//             data.push({
//                 age: count,
//                 grid: getStringFrom2DArray(updatedGridData)
//             });
//             ages_index++;
//         }
//
//         // Replace the originalGrid with updatedGridData
//         originalGrid.data = updatedGridData.map((arr) => arr.slice());
//         count++;
//     }
//
//     return data;
// };

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