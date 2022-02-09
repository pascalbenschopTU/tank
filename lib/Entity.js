const Constants = require('./Constants')
const Util = require('./Util')
const Vector = require('./Vector')

/**
 * Entity class.
 */
class Entity {
  /**
   * Constructor for an Entity class.
   * @param {Vector} position The position of the entity
   * @param {Vector} velocity The velocity of the entity
   * @param {number} hitboxSize The radius of the entity's circular hitbox
   */
  constructor(position, velocity, hitboxSize) {
    this.position = position || Vector.zero()
    this.velocity = velocity || Vector.zero()
    this.hitboxSize = hitboxSize
  }

  /**
   * Returns true if this Entity's hitbox is overlapping or touching another
   * Entity's hitbox.
   * @param {Entity} other The Entity to check collision against
   * @return {boolean}
   */
  collided(other) {
    const minDistance = this.hitboxSize + other.hitboxSize
    return Vector.sub(this.position, other.position).mag2 <= minDistance * minDistance
  }

  /**
   * Returns true if this Entity's hitbox is overlapping or touching another
   * Entity's hitbox.
   * @param {Entity} other The Entity to check collision against
   * @return {boolean}
   */
   collidedAt(other, position) {
    const minDistance = this.hitboxSize + other.hitboxSize
    return Vector.sub(this.position, position).mag2 <= minDistance * minDistance
  }

  /**
   * Returns true if this Entity is inside the bounds of the game environment
   * world.
   * @return {boolean}
   */
  inWorld() {
    //console.log(this.position.x + " x, max x: " + Constants.CANVAS_WIDTH);
    return Util.inBound(this.position.x, 0, Constants.CANVAS_WIDTH) &&
      Util.inBound(this.position.y, 0, Constants.CANVAS_HEIGHT)
  }

  /**
   * Bounds this Entity's position within the game world if it is outside of the
   * game world.
   */
   boundToWorld() {
    this.position.x = Util.bound(
      this.position.x, 10, Constants.CANVAS_WIDTH - 10)
    this.position.y = Util.bound(
      this.position.y, 10, Constants.CANVAS_HEIGHT - 10)
  }
}

module.exports = Entity