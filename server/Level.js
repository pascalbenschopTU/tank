const Constants = require("../lib/Constants");
const Vector = require("../lib/Vector");
const Wall = require('./Wall');

const levels = [
    [
        ["*****W******"],
        ["*****W**B***"],
        ["*****W******"],
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
     * Return current level.
     * @returns {GameMap} current level.
     */
    updateCurrentLevel() {
        this.makeLevel(levels[this.currentLevel]);
        if (levels.length > this.currentLevel) 
            this.currentLevel++;
        else
            this.currentLevel = 0;
    }

    /**
     * Make a level.
     * @param {Array} level 
     */
    makeLevel(level) {
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
        //console.log("x,y ",x,y," pos xy ",position.x, position.y, " canvas ", Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT, " levelsize ", this.levelSize);
        for (var i = y-1; i <= y+1; i++) {
            var surroundingsX = []
            for (var j = x-1; j <= x+1; j++) {
                if (i < 0 || j < 0 || i >= this.levelSize.y || j >= this.levelSize.x) {
                    surroundingsX.push(1);
                } else if (this.levelData[i][0][j] == "W") {
                    surroundingsX.push(1);
                } else {
                    surroundingsX.push(0);
                }
            }
            surroundings.push(surroundingsX);
        }

        return surroundings;
    }

    /**
     * Get the state from a position
     * @param {Vector} position 
     * @returns {number}
     */
    getStateFromPosition(position) {
        var x = Math.round((position.x / Constants.CANVAS_WIDTH) * (this.levelSize.x - 1));
        var y = Math.round((position.y / Constants.CANVAS_HEIGHT) * (this.levelSize.y - 1));

        if (this.levelData[x][0][y] == "W")
            return 1;
        else
            return 0;
    }
}

module.exports = Level