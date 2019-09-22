const {describe, it} = require('mocha');
const {expect, assert, should} = require('chai');
const Util = require('./Util');

describe('Count Neighbours 3x3', () => {
    const grid = Util.get2DArrayFromString({x: 3, y: 3, data: "*.*.**..*"});
    const output = [1, 4, 2, 2, 4, 3, 1, 3, 2];
    let index = 0;
    for (let i = 0; i < grid.x; i++) {
        for (let j = 0; j < grid.y; j++) {
            it(`Position [${i}][${j}] should pass`, () => {
                const count = Util.countNeighbours(grid, {x: i, y: j}, '*');
                expect(count).to.eql(output[index]);
                index++;
            });
        }
    }
});

describe('Count Neighbours 3x2', () => {
    const grid = Util.get2DArrayFromString({x: 3, y: 2, data: "*.*..*"});
    const output = [1, 2, 2, 3, 2, 1];
    let index = 0;
    for (let i = 0; i < grid.x; i++) {
        for (let j = 0; j < grid.y; j++) {
            it(`Position [${i}][${j}] should pass`, () => {
                const count = Util.countNeighbours(grid, {x: i, y: j}, '*');
                expect(count).to.eql(output[index]);
                index++;
            });
        }
    }
});

describe('Count Neighbours 2x3', () => {
    const grid = Util.get2DArrayFromString({x: 2, y: 3, data: "*.*..*"});
    const output = [0, 3, 1, 1, 3, 1];
    let index = 0;
    for (let i = 0; i < grid.x; i++) {
        for (let j = 0; j < grid.y; j++) {
            it(`Position [${i}][${j}] should pass`, () => {
                const count = Util.countNeighbours(grid, {x: i, y: j}, '*');
                expect(count).to.eql(output[index]);
                index++;
            });
        }
    }
});