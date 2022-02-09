const Bullet = require('./Bullet')

const Constants = require('../../lib/Constants')
const Entity = require('../../lib/Entity')
const Util = require('../../lib/Util')
const Vector = require('../../lib/Vector')

/**
 * Player class.
 * @extends Entity
 */
class Player extends Entity {
  /**
   * Constructor for a Player object.
   * @constructor
   * @param {string} name The display name of the player
   * @param {string} socketID The associated socket ID
   * @param {Vector} position The player's starting location
   * @param {number} angle The player's starting tank angle
   */
  constructor(name, socketID) {
    super();

    this.name = name
    this.socketID = socketID

    this.lastUpdateTime = 0
    this.tankAngle = 0
    this.turretAngle = 0
    this.turnRate = 0
    this.speed = Constants.PLAYER_DEFAULT_SPEED
    this.shotCooldown = Constants.PLAYER_SHOT_COOLDOWN
    this.lastShotTime = 0
    this.hitboxSize = Constants.PLAYER_DEFAULT_HITBOX_SIZE

    this.bullets = 5

    this.kills = 0
    this.deaths = 0
    this.destroyed = false;
  }

  /**
   * Creates a new Player object.
   * @param {Vector} position
   * @param {string} name The display name of the player
   * @param {string} socketID The associated socket ID
   * @return {Player}
   */
  static create(position, name, socketID) {
    const player = new Player(name, socketID)
    player.spawn(position);

    return player
  }

  /**
   * Update this player given the client's input data from Input.js
   * @param {Object} data A JSON Object storing the input state
   */
  updateOnInput(data) {
    if (data.up) {
      this.velocity = Vector.fromPolar(this.speed, this.tankAngle)
    } else if (data.down) {
      this.velocity = Vector.fromPolar(-this.speed, this.tankAngle)
    } else if (!(data.up ^ data.down)) {
      this.velocity = Vector.zero()
    }

    if (data.right) {
      this.turnRate = Constants.PLAYER_TURN_RATE
    } else if (data.left) {
      this.turnRate = -Constants.PLAYER_TURN_RATE
    } else if (!(data.left ^ data.right)) {
      this.turnRate = 0
    }
    this.turretAngle = data.turretAngle
  }

  /**
   * Performs a physics update.
   * @param {number} lastUpdateTime The last timestamp an update occurred
   * @param {number} deltaTime The timestep to compute the update with
   */
  update(lastUpdateTime, deltaTime, walls) {
    var previousPos = this.position.copy();
    this.lastUpdateTime = lastUpdateTime
    this.position.add(Vector.scale(this.velocity, deltaTime))
    this.boundToWorld()
    this.checkPlayerCollision(walls, previousPos);
    this.tankAngle = Util.normalizeAngle(
      this.tankAngle + this.turnRate * deltaTime)
  }

  /**
   * Checking collision of wall with bullet.
   * @param {Array<Wall>} walls 
   */
   checkPlayerCollision(walls, previousPos) {
    walls.forEach(wall => {
        var minX = wall.minX - this.hitboxSize;
        var minY = wall.minY - this.hitboxSize;
        var maxX = wall.maxX + this.hitboxSize;
        var maxY = wall.maxY + this.hitboxSize;
        if (Util.inBound(this.position.y, minY, maxY)) {
          this.position.x = Util.reverseBound(
            this.position.x, previousPos.x, minX, maxX
          );
        }
        if (Util.inBound(this.position.x, minX, maxX)) {
          this.position.y = Util.reverseBound(
            this.position.y, previousPos.y, minY, maxY
          );
        }
    });
  }


  reverseBound() {
    if (Util.inBound(this.position.x, minX, maxX)) {

    }
  }

  /**
   * Returns a boolean indicating if the player can shoot.
   * @return {boolean}
   */
  canShoot() {
    return this.lastUpdateTime > this.lastShotTime + this.shotCooldown && this.bullets > 0;
  }

  /**
   * Returns an array containing new projectile objects as if the player has
   * fired a shot given their current powerup state. This function does not
   * perform a shot cooldown check and resets the shot cooldown.
   * @return {Array<Bullet>}
   */
  getProjectilesFromShot() {
    const bullets = [Bullet.createFromPlayer(this)];

    this.bullets -= 1;
    
    this.lastShotTime = this.lastUpdateTime
    return bullets
  }

  /**
   * Returns a boolean determining if the player is dead or not.
   * @return {boolean}
   */
  isDead() {
    return this.health <= 0
  }

  /**
   * Handles the spawning (and respawning) of the player.
   */
  spawn(position) {
    this.position = position.copy();
  }
}

module.exports = Player