
const Util = require("../lib/Util");
const Vector = require("../lib/Vector");
const Entity = require("../lib/Entity");

/**
 * Wall class
 */
class Wall {
    
    /**
     * Constructor for Wall object.
     * @constructor
     * @param {Vector} position 
     * @param {number} width 
     * @param {number} height 
     */
    constructor(position, width, height) {
        this.position = position;

        this.width = width;
        this.height = height;

        this.minX = position.x - width / 2;
        this.minY = position.y - height / 2;
        this.maxX = position.x + width / 2;
        this.maxY = position.y + height / 2;
    }

    /**
     * Override collided method.
     * @param {Entity} other 
     */
    collided(other) {
        return Util.inBound(other.position.x, this.minX, this.maxX) &&
            Util.inBound(other.position.y, this.minY, this.maxY);
    }


    collidedAt(position) {
        return Util.inBound(position.x, this.minX, this.maxX) &&
            Util.inBound(position.y, this.minY, this.maxY);
    }
}

module.exports = Wall