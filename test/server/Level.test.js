const Constants = require("../../lib/Constants");
const Vector = require("../../lib/Vector");
const Level = require("../../server/Level")

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

/**
 * Get an initialised level from index
 * @param {number} index 
 * @returns {Level} initialised level
 */
function getInitialisedLevelFromIndex(index) {
    var l = new Level();
    l.setLevels(testLevels);
    l.makeLevel(index);

    return l;
}

// index = [
//     [0,1,2], 
//     [3,4,5], 
//     [6,7,8]
// ]

test("getSurroundings returns correct int for border", () => {
    l = getInitialisedLevelFromIndex(0);

    var position = new Vector(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
    
    var expectedValue = [0, 0, 1, 0, 0, 1, 1, 1, 1];
    expect(l.getSurroundings(position)).toEqual(expectedValue)
})

test("getSurroundings returns correct int for walls and border", () => {
    l = getInitialisedLevelFromIndex(1);

    var position = new Vector(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
    
    var expectedValue = [1, 1, 1, 1, 0, 1, 1, 1, 1];
    expect(l.getSurroundings(position)).toEqual(expectedValue)
})

test("getCurrentMap returns correct map for empty map", () => {
    l = getInitialisedLevelFromIndex(0);

    var playerPosition = l.getCoordinatesFromPosition(new Vector(100, 100));
    var botPosition = l.getCoordinatesFromPosition(new Vector(Constants.CANVAS_WIDTH - 100, Constants.CANVAS_HEIGHT - 100));
    
    var expectedValue = [1,0,0,0,0,0,0,0,2];
    expect(l.getCurrentMap(playerPosition, botPosition)).toEqual(expectedValue);
})

test("getCurrentMap returns correct map for map with walls", () => {
    l = getInitialisedLevelFromIndex(1);

    var playerPosition = l.getCoordinatesFromPosition(new Vector(100, 100));
    var botPosition = l.getCoordinatesFromPosition(new Vector(Constants.CANVAS_WIDTH - 100, Constants.CANVAS_HEIGHT - 100));
    
    var expectedValue = [1,0,0,0,3,3,0,3,2];
    expect(l.getCurrentMap(playerPosition, botPosition)).toEqual(expectedValue);
})