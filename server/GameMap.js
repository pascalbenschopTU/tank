const Wall = require('./Wall');
const SimpleEnemy = require('./entities/SimpleEnemy');
const Vector = require('../lib/Vector');
const Constants = require('../lib/Constants');

/**
 * Game map class.
 */
class GameMap {

    /**
     * Game map constructor.
     */
    constructor() {
        this.levelSize = new Vector(0,0);
        this.levelData = [];
        this.playerPositions = [];
        this.walls = [];
        this.bots = [];
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
        this.bots.push(new SimpleEnemy(position))
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
        console.log(surroundings);

        return surroundings;
    }
}

module.exports = GameMap