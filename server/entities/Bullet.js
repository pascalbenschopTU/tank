const Constants = require('../../lib/Constants')
const Entity = require('../../lib/Entity')
const Vector = require('../../lib/Vector')
const Util = require('../../lib/Util')

/**
 * Bullet class.
 */
class Bullet extends Entity {
  /**
   * Constructor for a Bullet object.
   * @constructor
   * @param {Vector} position The starting position vector
   * @param {Vector} velocity The starting velocity vector
   * @param {number} angle The orientation of the bullet
   * @param {Player} source The Player object firing the bullet
   */
  constructor(position, velocity, angle, source) {
    super(position, velocity, Constants.BULLET_HITBOX_SIZE);

    this.angle = angle;
    this.source = source;

    this.bounce = 2;

    this.distanceTraveled = 0;
    this.destroyed = false;
  }

  /**
   * Creates a new Bullet object from a Player object firing it.
   * @param {Player} player The Player object firing the bullet
   * @param {number} [angleDeviation=0] The angle deviation if the bullet is
   *   not traveling in the direction of the turret
   * @return {Bullet}
   */
  static createFromPlayer(player, angleDeviation = 0) {
    const angle = player.turretAngle + angleDeviation;
    const velocity = Vector.fromPolar(Constants.BULLET_SPEED, angle)
    return new Bullet(
      Vector.add(player.position.copy(), Vector.scale(velocity, 20)),
      velocity,
      angle,
      player
    );
  }

  /**
   * Performs a physics update.
   * @param {number} lastUpdateTime The last timestamp an update occurred
   * @param {number} deltaTime The timestep to compute the update with
   * TODO fix bounce
   */
  update(lastUpdateTime, deltaTime, walls) {
    var previousPos = this.position.copy();
    const distanceStep = Vector.scale(this.velocity, deltaTime);
    this.position.add(distanceStep);
    this.distanceTraveled += distanceStep.mag2;
    if (this.bounce > 0) {
        this.checkBulletCollision(walls, previousPos);
    } else {
      this.destroyed = true;
      this.source.bullets += 1;
    }
    
  }


  /**
   * Checking collision of wall with bullet.
   * @param {Array<Wall>} walls 
   */
  checkBulletCollision(walls, previousPos) {
    walls.forEach(wall => {
      if (wall.collided(this)) {
        if (Util.reverseBounce(this.position.x, previousPos.x, wall.minX, wall.maxX)) {
          this.angle = Math.PI - this.angle;
          this.velocity = Vector.fromPolar(Constants.BULLET_SPEED, this.angle);
          this.bounce -= 1;
        }
        else if (Util.reverseBounce(this.position.y, previousPos.y, wall.minY, wall.maxY)) {
          this.angle = -this.angle;
          this.velocity = Vector.fromPolar(Constants.BULLET_SPEED, this.angle);
          this.bounce -=1;
        }
      }
    });

    if(!Util.inBound(this.position.x, 0, Constants.CANVAS_WIDTH)) {
      this.angle = Math.PI - this.angle;
      this.velocity = Vector.fromPolar(Constants.BULLET_SPEED, this.angle);
      this.bounce -= 1;
    }
    if(!Util.inBound(this.position.y, 0, Constants.CANVAS_HEIGHT)) {
        this.angle = -this.angle;
        this.velocity = Vector.fromPolar(Constants.BULLET_SPEED, this.angle);
        this.bounce -= 1;
    } 
  }
}

module.exports = Bullet