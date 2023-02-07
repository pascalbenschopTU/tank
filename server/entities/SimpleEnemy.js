const Vector = require('../../lib/Vector');
const Player = require('./Player');
const Util = require('../../lib/Util');
const Constants = require('../../lib/Constants');
const Level = require('../Level');

const tf = require('@tensorflow/tfjs');


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

        this.surroundings = [];

        this.closestPlayer = null;

        this.botToPlayerAngle = 0;

        this.bullets = 5;
    } 

    /**
     * Return copy.
     * @returns {SimpleEnemy}
     */
    copy() {
        return new SimpleEnemy(this.position);
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
     * Update the surroundings of a bot based on position
     * @param {Level} level 
     */
    updateSurroundings(level) {
        this.surroundings = level.getSurroundings(this.position);
    }

    /**
     * Update input on players.
     * @param {Array<Player>} players
     * @param {Level} level
     */
    updateOnPlayerInput(players, level) {
        this.updateSurroundings(level);

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
            const playerToBotVector = Vector.sub(this.closestPlayer.position, this.position);
            this.botToPlayerAngle = Util.normalizeAngle(playerToBotVector.angle)

            this.updateTurretAngle(this.botToPlayerAngle);
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

    move(action) {
        switch (this.agent.get_action(action)) {
            case "TURNLEFT":
                this.turnRate = -Constants.PLAYER_TURN_RATE;
                this.velocity = Vector.zero;
            case "TURNRIGHT":
                this.turnRate = Constants.PLAYER_TURN_RATE;
                this.velocity = Vector.zero;
            case "FORWARD":
                this.velocity = Vector.fromPolar(this.speed, this.tankAngle)
                this.turnRate = 0;
            case "BACKWARD":
                this.velocity = Vector.fromPolar(-this.speed, this.tankAngle)
                this.turnRate = 0;
        }
    }

    getDistanceToPlayer() {
        return this.position.distance(this.closestPlayer.position);
    }

    getStateTensor() {
        return tf.tensor2d([[this.position, this.velocity]])
    }

    getNextState(gameMap) {
        if (this.velocity != Vector.zero) {
            var new_position = Vector.add(this.position, this.velocity);
            return gameMap.getStateFromPosition(new_position)
        } else {
            return 0;
        }
    }
}



module.exports = SimpleEnemy