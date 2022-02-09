const Wall = require('./Wall');
const SimpleEnemy = require('./entities/SimpleEnemy');
const Vector = require('../lib/Vector');

/**
 * Game map class.
 */
class GameMap {

    /**
     * Game map constructor.
     */
    constructor() {
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
        this.bots.push(SimpleEnemy.create(position))
    }
}

module.exports = GameMap