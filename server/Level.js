const Constants = require("../lib/Constants");
const Vector = require("../lib/Vector");
const Wall = require('./Wall');
const Util = require('../lib/Util')

const levels = [
    [
        [".......W......"],
        ["...WWW.WW....."],
        [".....W.......B"],
        ["..P..WWWW....B"],
        ["...W...W.....B"],
        ["...W.WWWW....."],
        ["...W.........."]
    ],
    [
        ["*****W******"],
        ["*****W******"],
        ["*****W***B**"],
        ["*****W******"],
        ["P****W******"],
        ["************"],
        ["************"],
        ["************"]
    ],
    [
        ["*****W******"],
        ["P****W**B***"],
        ["*****W******"],
        ["*****W******"],
        ["************"],
        ["*****W******"],
        ["P****W**B***"],
        ["*****W******"]
    ],
    [
        ["*****W******"],
        ["P****W**BB**"],
        ["*****W**BB**"],
        ["**W**WWW****"],
        ["**W*********"],
        ["**WWWW**BB**"],
        ["P****W**BB**"],
        ["**W**W******"]
    ],
    [
        ["******W**************"],
        ["******W*****W*****B**"],
        ["*P****W*****W********"],
        ["*****WW*****WWW***B**"],
        ["*********************"],
        ["*******WWW********B**"],
        ["*********W****W******"],
        ["************WWW***B**"],
        ["*****WWW****W********"],
        ["*****W************B**"],
        ["*****W*******WW******"],
        ["**************W***B**"]
    ]
]

/**
 * Class Level.
 */
class Level {
    constructor() {
        this.levels = [];

        this.currentLevel = 0;

        this.levelSize = new Vector(0,0);
        this.levelData = [];
        this.playerPositions = [];
        this.walls = [];
        this.bots = [];
    }

    /**
     * Get the length of the levels
     * @returns {number} length of levels
     */
    getAmountOfLevels() {
        return levels.length;
    }

    /**
     * Return current level.
     * @returns {GameMap} current level.
     */
    updateCurrentLevel() {
        this.makeLevel(this.currentLevel);
        if (this.currentLevel < (levels.length - 1)) 
            this.currentLevel++;
        else
            this.currentLevel = 0;
    }

    /**
     * Make a level.
     * @param {number} level 
     */
    makeLevel(levelIndex) {
        let level = levels[levelIndex]
        this.currentLevel = levelIndex;

        this.removePreviousLevel();
        this.setLevelSize(new Vector(level[0][0].length, level.length))
        this.setLevelData(level);

        var y = Constants.CANVAS_HEIGHT / level.length
        var new_y = y / 2
        for (let i = 0; i < level.length; i++) {
            var x = Constants.CANVAS_WIDTH / level[i][0].length
            var new_x = x / 2
            var string = level[i][0];
            for (let j = 0; j < string.length; j++) {
                switch(string[j]) {
                    case "W":
                        this.makeWall(new Vector(new_x, new_y), x + 1, y + 1); // To make walls more overlapping add small value
                        break;
                    case "B":
                        this.makeBot(new Vector(new_x, new_y));
                        break;
                    case "P":
                        this.makePlayerPosition(new Vector(new_x, new_y));
                        break;
                    default:
                        break;
                }
                new_x += x;
            }
            new_y += y;
        }
    }

    removePreviousLevel() {
        this.bots = [];
        this.walls = [];
        this.playerPositions = [];
    }

    get gameBots() {
        var result = []
        this.bots.forEach(bot => {
            result.push(bot.copy());
        });

        return result;
    }

    get gameWalls() {
        var result = []
        this.walls.forEach(wall => {
            result.push(wall.copy());
        });

        return result;
    }

    get gamePlayerPositions() {
        var result = []
        this.playerPositions.forEach(playerPosition => {
            result.push(playerPosition.copy());
        });

        return result;
    }

    /**
     * Set level size.
     * @param {Vector} levelSize 
     */
    setLevelSize(levelSize) {
        this.levelSize = levelSize;
    }

    /**
     * Set level data.
     * @param {Array} levelData 
     */
    setLevelData(levelData) {
        this.levelData = levelData;
    }

    /**
     * Add player position to map.
     * @param {Vector} position 
     */
    makePlayerPosition(position) {
        this.playerPositions.push(position);
    }

    /**
     * Add a wall to the map.
     * @param {Vector} position 
     * @param {Number} width 
     * @param {Number} height 
     */
    makeWall(position, width, height) {
        this.walls.push(new Wall(position, width, height));
    }

    /**
     * Add bot to map.
     * @param {Vector} position 
     */
    makeBot(position) {
        this.bots.push(position)
    }

    getSurroundings(position) {
        var surroundings = []
        // Get index of position of agent in level
        var x = Math.round((position.x / Constants.CANVAS_WIDTH) * (this.levelSize.x - 1));
        var y = Math.round((position.y / Constants.CANVAS_HEIGHT) * (this.levelSize.y - 1));
        for (var i = y-1; i <= y+1; i++) {
            for (var j = x-1; j <= x+1; j++) {
                if (i < 0 || j < 0 || i >= this.levelSize.y || j >= this.levelSize.x) {
                    surroundings.push(1);
                } else if (this.levelData[i][0][j] == "W") {
                    surroundings.push(1);
                } else {
                    surroundings.push(0);
                }
            }
        }

        return surroundings;
    }

    /**
     * Get a 1d map of the level with player position and bot position.
     * @param {Vector} playerPosition 
     * @param {Vector} botPosition 
     * @returns {Array} map
     */
    getCurrentMap(playerPosition, botPosition) {
        let map = Array(this.levelSize.x * this.levelSize.y).fill(0);
        if (this.isPositionInsideLevel(playerPosition) && this.isPositionInsideLevel(botPosition)) {
            for (var y_index = 0; y_index < this.levelSize.y; y_index++) {
                if (this.levelData[y_index].length > 0) {
                    var currentRow = this.levelData[y_index][0];
                    for (var x_index = 0; x_index < currentRow.length; x_index++) {
                        var index = y_index * this.levelSize.y + x_index
                        map[index] = 0;
                        if (playerPosition.y == y_index && playerPosition.x == x_index) {
                            map[index] = 1;
                        }
                        if (botPosition.y == y_index && botPosition.x == x_index) {
                            map[index] = 2;
                        }
                        if (currentRow[x_index] == "W") {
                            map[index] = 3;
                        }
                    }
                }
            }
        }

        return map;
    }

    isPositionInsideLevel(position) {
        return (position.x >= 0 && position.y >= 0) && (position.x < this.levelSize.x && position.y < this.levelSize.y);
    }

    /**
     * Get the state from a position
     * @param {Vector} position 
     * @returns {Vector}
     */
    getCoordinatesFromPosition(position) {
        var x = Math.ceil((position.x / Constants.CANVAS_WIDTH) * (this.levelSize.x)) -1;
        var y = Math.ceil((position.y / Constants.CANVAS_HEIGHT) * (this.levelSize.y)) -1;

        return new Vector(x,y);
    }

    /**
     * Get the coordinates from [0, 1]
     * @param {Vector} position 
     * @returns {Vector} normalized position
     */
    getCoordinatesNormalized(position) {
        var x = position.x / Constants.CANVAS_WIDTH;
        var y = position.y / Constants.CANVAS_HEIGHT;

        return new Vector(x,y);
    }

    /**
     * Check if position inside a wall
     * @param {Vector} coordinates 
     * @returns 
     */
    isPositionInWall(coordinates) {
        if (Util.inBound(coordinates.x, 0, this.levelSize.x - 1) && Util.inBound(coordinates.y, 0, this.levelSize.y - 1)) {
            if (this.levelData[coordinates.y][0][coordinates.x] == "W")
                return true;
            else
                return false;
        } else {
            // position is outside bounds
            return true;
        }
        
    }
}

module.exports = Level