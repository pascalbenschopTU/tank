const Constants = require("../lib/Constants");
const Vector = require("../lib/Vector");
const Level = require("./Level")

const testLevels = [
    [
        ["..."],
        ["..."],
        ["..."],
    ],
    [
        ["..."],
        [".WW"],
        [".W."],
    ]
]

// index = [
//     [0,1,2], 
//     [3,4,5], 
//     [6,7,8]
// ]

test("getSurroundings returns correct int for border", () => {
    var l = new Level();
    l.makeLevel(testLevels[0]);

    var position = new Vector(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
    
    var expectedValue = (1<<2) + (1<<5) + (1<<6) + (1<<7) + (1<<8);
    expect(l.getSurroundings(position)).toBe(expectedValue)
})

test("getSurroundings returns correct int for walls and border", () => {
    var l = new Level();
    l.makeLevel(testLevels[1]);

    var position = new Vector(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
    
    var expectedValue = (1<<0) + (1<<1) + (1<<2) + (1<<3) + (1<<5) + (1<<6) + (1<<7) + (1<<8);
    expect(l.getSurroundings(position)).toBe(expectedValue)
})

test("getCurrentMap returns correct map for empty map", () => {
    var l = new Level();
    l.makeLevel(testLevels[0]);

    var playerPosition = l.getCoordinatesFromPosition(new Vector(100, 100));
    var botPosition = l.getCoordinatesFromPosition(new Vector(Constants.CANVAS_WIDTH - 100, Constants.CANVAS_HEIGHT - 100));
    
    var expectedValue = [1,0,0,0,0,0,0,0,2];
    expect(l.getCurrentMap(playerPosition, botPosition)).toEqual(expectedValue);
})

test("getCurrentMap returns correct map for map with walls", () => {
    var l = new Level();
    l.makeLevel(testLevels[1]);

    var playerPosition = l.getCoordinatesFromPosition(new Vector(100, 100));
    var botPosition = l.getCoordinatesFromPosition(new Vector(Constants.CANVAS_WIDTH - 100, Constants.CANVAS_HEIGHT - 100));
    
    var expectedValue = [1,0,0,0,3,3,0,3,2];
    expect(l.getCurrentMap(playerPosition, botPosition)).toEqual(expectedValue);
})