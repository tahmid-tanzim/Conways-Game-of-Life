const cell = {LIVE: '*', DEAD: '.'};

const getStringFrom2DArray = (data) => [].concat.apply([], data).join('');

const get2DArrayFromString = ({x, y, data}) => {
    const dataArr = data.split('');
    let data2DArray = [];

    while (dataArr.length) {
        data2DArray.push(dataArr.splice(0, y));
    }

    return {x, y, data: data2DArray};
};

/**
 * @position = {x, y}
 * @type is Live or Dead Neighbours?
 * */
const countNeighbours = (grid, position, type) => {
    const {x, y} = position;
    let counter = 0;
    for (let i = Math.max(0, x - 1); i <= Math.min(x + 1, grid.x - 1); i++) {
        for (let j = Math.max(0, y - 1); j <= Math.min(y + 1, grid.y - 1); j++) {
            if ((i !== x || j !== y) && grid.data[i][j] === type) {
                counter++;
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

    if (originalGrid.data[x][y] === cell.LIVE && (neighboursCount < 2 || neighboursCount > 3)) {
        updatedGridData[x][y] = cell.DEAD;
    }

    if (originalGrid.data[x][y] === cell.DEAD && neighboursCount === 3) {
        updatedGridData[x][y] = cell.LIVE;
    }

    return updatedGridData;
};

const calculateAge = (agesArray, grid) => {
    const maxCount = Math.max(...agesArray);
    // console.log('max count: ', maxCount);
    let originalGrid = get2DArrayFromString(grid);
    // Deep copy
    let updatedGridData = originalGrid.data.map((arr) => arr.slice());
    let count = 1, ages_index = 0, data = [];

    while (count <= maxCount) {
        console.log(`-------- ${count} --------`);
        let neighboursCount = 0;
        for (let i = 0; i < originalGrid.x; i++) {
            for (let j = 0; j < originalGrid.y; j++) {
                neighboursCount = countNeighbours(originalGrid, {x: i, y: j}, cell.LIVE);
                console.log(`Positions: ${i} - ${j} ->`, neighboursCount);
                updatedGridData = update(originalGrid, updatedGridData, {x: i, y: j}, neighboursCount);
            }
        }

        // Store in data array
        if (count === agesArray[ages_index]) {
            data.push({
                age: count,
                grid: getStringFrom2DArray(updatedGridData)
            });
            ages_index++;
        }

        // Replace the originalGrid with updatedGridData
        originalGrid.data = updatedGridData.map((arr) => arr.slice());
        count++;
    }

    return data;
};

module.exports = {
    calculateAge,
    countNeighbours, // Exported Only for test purpose
    get2DArrayFromString // Exported Only for test purpose
};