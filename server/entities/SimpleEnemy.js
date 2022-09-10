const Vector = require('../../lib/Vector');
const Player = require('./Player');
const Util = require('../../lib/Util');
const Constants = require('../../lib/Constants');
const Bullet = require('./Bullet');

/**
 * Simple enemy class.
 */
class SimpleEnemy extends Player {

    /**
     * Creates a simple enemy.
     * @param {Vector} position 
     */
    constructor(position) {
        super();
        this.name = Constants.BOT_NAME;
        this.position = position;

        this.speed = Constants.BOT_DEFAULT_SPEED

        this.shotCooldown = Constants.BOT_SHOT_COOLDOWN

        this.closestPlayer = null;

        this.botToPlayerAngle = 0;

        this.bullets = 5;
    } 


    /**
     * Check if bot can shoot.
     * @param {Array<Wall} walls 
     * @returns 
     */
    canShoot(walls) {  
        return this.checkPlayerReachable(walls)
            && this.checkPlayerInSight() 
            && this.checkBotCooldown() 
            && this.bullets > 0;
    }

    /**
     * Check if bot can shoot based on cooldown.
     * @returns {Boolean}
     */
    checkBotCooldown() {
        return this.lastUpdateTime > this.lastShotTime + this.shotCooldown 
    }

    /**
     * Check if player in sight.
     * @returns {Boolean}
     */
    checkPlayerInSight() {
        return Util.inBound(this.botToPlayerAngle, this.turretAngle - 0.1, this.turretAngle + 0.1);
    }
    
    /**
     * Check if player in sight.
     * @param {Array<Player} players 
     * @param {Array<Wall} walls 
     * @returns 
     */
    checkPlayerReachable(walls) {
        var result = true;
        if (this.closestPlayer != null) {
            var D = Vector.fromPolar(1, this.turretAngle);
            var O = this.position;
            var t = Vector.divide(Vector.sub(this.closestPlayer.position, O), D);
            walls.forEach(wall => {
                var invx = 1/D.x
                var invy = 1/D.y
                var tMinX, tMaxX, tMinY, tMaxY;
                if (invx >= 0) {
                    tMinX = (wall.minX - O.x) * (invx);
                    tMaxX = (wall.maxX - O.x) * (invx);
                } else {
                    tMinX = (wall.maxX - O.x) * (invx);
                    tMaxX = (wall.minX - O.x) * (invx);
                }
                if (invy >= 0) {
                    tMinY = (wall.minY - O.y) * (invy);
                    tMaxY = (wall.maxY - O.y) * (invy);
                } else {
                    tMinY = (wall.maxY - O.y) * (invy);
                    tMaxY = (wall.minY - O.y) * (invy);
                }
                
                var tMin = Math.max(tMinX, tMinY);
                var tMax = Math.min(tMaxX, tMaxY);

                if (tMinX > tMaxY || tMinY > tMaxX ||
                    (tMin > t.x && tMax > t.y)
                    ) {
                    result = result && true;
                } else {
                    result = false
                }
            });

            return result;
        }
    }


    /**
     * Creates a new Player object.
     * @param {Vector} position
     * @return {Player}
     */
    static create(position) {
        const player = new SimpleEnemy(position)
        player.spawn()
        return player
    }

    /**
     * Return copy.
     * @returns {SimpleEnemy}
     */
    copy() {
        return new SimpleEnemy(this.position);
    }


    /**
     * Spawn simple enemy.
     */
    spawn() {
        this.angle = Util.randRange(0, 2 * Math.PI)
    }

    /**
     * Update input on players.
     * @param {Array<Player>} players 
     * @param {Array<Bullet>} projectiles
     */
    updateOnPlayerInput(players, projectiles) {
        if (players && players.length > 1) {
            this.closestPlayer = players[0];
            var closestDistance = Constants.CANVAS_HEIGHT * Constants.CANVAS_WIDTH;
            for (let i = 0; i < players.length; i++) {
                if (players[i].name != this.name) {
                    var d = this.position.distance(players[i].position)
                    if (d < closestDistance) {
                        closestDistance = d;
                        this.closestPlayer = players[i];
                    }
                }
            }

            var evasive = false;
            var b = null

            for (let i = 0; i < projectiles.length; i++) {
                b = projectiles[i]
                if (b.source != this) {
                    var t = this.position.distance(b.position);
                    if (t > 400) {
                        continue;
                    }
                    var d = b.velocity.normalize;
                    var p = Vector.add(b.position, Vector.scale(d, t));

                    if (this.collidedAt(projectiles[i], p)) {
                        evasive = true;
                        break;
                    }
                }
                
            }

            const playerToBotVector = Vector.sub(this.closestPlayer.position, this.position);
            this.botToPlayerAngle = Util.normalizeAngle(playerToBotVector.angle)

            this.updateTurretAngle(this.botToPlayerAngle);

            if (evasive) {
                this.moveAway(b);
            } else {
                this.moveToPlayer(closestDistance);
            }
        }
    }

    /**
     * Update steering of bot.
     * @param {Number} normalizedAngle 
     */
    updateTurretAngle(normalizedAngle) {
        var positiveSteering = Util.normalizeAngle(this.turretAngle + 0.02);
        var negativeSteering = Util.normalizeAngle(this.turretAngle - 0.02);
        if (normalizedAngle < 0) {
            if (this.turretAngle < 0) {
                if (this.turretAngle < normalizedAngle) {
                    this.turretAngle = positiveSteering
                } else {
                    this.turretAngle = negativeSteering
                }
            } else { //this.turretAgnle >= 0
                var posAngle = normalizedAngle
                if (posAngle < this.turretAngle) {
                    this.turretAngle = negativeSteering;
                } else {
                    this.turretAngle = positiveSteering;
                }
            }   
        } else { // normalizedAngle >= 0
            if (this.turretAngle < 0) {
                var posAngle = this.turretAngle
                if (posAngle < normalizedAngle) {
                    this.turretAngle = negativeSteering;
                } else {
                    this.turretAngle = positiveSteering;
                }
            } else {
                if (this.turretAngle < normalizedAngle) {
                    this.turretAngle = positiveSteering;
                } else {
                    this.turretAngle = negativeSteering;
                }
            }
        }
    }

    /**
     * Move away from bullet.
     * @param {Bullet} bullet 
     */
    moveAway(bullet) {
        if (Math.abs(this.tankAngle - bullet.angle) > Math.PI / 2) {
            this.turnRate = 0;
            this.velocity = Vector.fromPolar(this.speed, this.tankAngle);
        } else {
            this.velocity = Vector.fromPolar(-this.speed, this.tankAngle);
            this.turnRate = Constants.PLAYER_TURN_RATE;
        }
    }

    /**
     * Move to closest player.
     * @param {Number} closestDistance 
     */
    moveToPlayer(closestDistance) {
        this.velocity = Vector.fromPolar(this.speed, this.tankAngle);

        if (closestDistance < 400) {
            this.turnRate = Constants.PLAYER_TURN_RATE;
        } else if (closestDistance > 700 && 
            (this.tankAngle < this.turretAngle -0.1 || this.tankAngle > this.turretAngle + 0.1)) {
            this.turnRate = -Constants.PLAYER_TURN_RATE;
        } else {
            this.turnRate = 0;
        }
    }



}



module.exports = SimpleEnemy