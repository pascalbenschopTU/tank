const Wall = require('./Wall');
const SimpleEnemy = require('./SimpleEnemy');
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
        return [...this.bots.values()];
    }

    get gameWalls() {
        return [...this.walls.values()];
    }

    get gamePlayerPositions() {
        return [...this.playerPositions.values()];
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