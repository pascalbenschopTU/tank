const Vector = require('../../lib/Vector');
const Player = require('./Player');
const Util = require('../../lib/Util');
const Constants = require('../../lib/Constants');
const Level = require('../level/Level');


/**
 * Simple enemy class.
 */
class SimpleEnemy extends Player {

    /**
     * Creates a simple enemy.
     * @param {Vector} position 
     * @param {Level} level
     */
    constructor(position, level) {
        super();
        this.name = Constants.BOT_NAME + "_" + Util.generateRandomString(10);
        this.position = position;
        this.level = level;
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
     * Update the bot.
     * @param {Number} move of the bot
     * @returns {Array<Bullet>} bullets
     */
    updateAI(move) {
        this.moveAgent(move);
        
        if (this.canShoot(this.level.gameWalls)) {
            return this.getProjectilesFromShot()
        } else {
            return []
        }
    }

    /**
     * Check if bot can shoot.
     * @param {Array<Wall} walls 
     * @returns 
     */
    canShoot(walls) {  
        return this.isPlayerReachable(walls)
            && this.isPlayerInSight() 
            && this.hasBotCooldown() 
            && this.bullets > 0;
    }

    /**
     * Check if bot can shoot based on cooldown.
     * @returns {Boolean}
     */
    hasBotCooldown() {
        return this.lastUpdateTime > this.lastShotTime + this.shotCooldown 
    }

    /**
     * Check if player in sight.
     * @returns {Boolean}
     */
    isPlayerInSight() {
        return Util.inBound(this.botToPlayerAngle, this.turretAngle - 0.1, this.turretAngle + 0.1);
    }

    /**
     * Check if bot is going towards the player.
     * @returns {Boolean}
     */
    isDirectionTowardPlayer() {
        return Util.inBound(this.botToPlayerAngle, this.tankAngle - 0.5, this.tankAngle + 0.5);
    }
    
    /**
     * Check if player in sight.
     * @param {Array<Player} players 
     * @param {Array<Wall} walls 
     * @returns 
     */
    isPlayerReachable(walls) {
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
     */
    updateSurroundings() {
        this.surroundings = this.level.getSurroundings(this.position);
    }

    /**
     * Update input on players.
     * @param {Array<Player>} players
     * @param {Level} level
     */
    updateBotsOnPlayers(players) {
        this.updateSurroundings();

        if (players && players.length > 0) {
            this.closestPlayer = null;
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

            if (this.closestPlayer) {
                this.botToPlayerAngle = this.getAngleToClosestPlayer();
                this.updateTurretAngle(this.botToPlayerAngle);
            }
        }
    }

    /**
     * Get the angel to the closest player.
     * @returns {number} angle to closest player
     */
    getAngleToClosestPlayer() {
        const playerToBotVector = Vector.sub(this.closestPlayer.position, this.position);
        
        return Util.normalizeAngle(playerToBotVector.angle)
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
                if (normalizedAngle < this.turretAngle) {
                    this.turretAngle = positiveSteering;
                } else {
                    this.turretAngle = negativeSteering;
                }
            }   
        } else { // normalizedAngle >= 0
            if (this.turretAngle < 0) {
                if (this.turretAngle < normalizedAngle) {
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

    moveAgent(action) {
        switch (action) {
            case Constants.BOT_ACTION_TURNLEFT:
                this.turnRate = -Constants.PLAYER_TURN_RATE;
                this.velocity = Vector.zero();
                break;
            case Constants.BOT_ACTION_TURNRIGHT:
                this.turnRate = Constants.PLAYER_TURN_RATE;
                this.velocity = Vector.zero();
                break;
            case Constants.BOT_ACTION_FORWARD:
                this.velocity = Vector.fromPolar(Constants.BOT_DEFAULT_SPEED, this.tankAngle)
                this.turnRate = 0;
                break;
            case Constants.BOT_ACTION_BACKWARD:
                this.velocity = Vector.fromPolar(-Constants.BOT_DEFAULT_SPEED, this.tankAngle)
                this.turnRate = 0;
                break;
        }
    }

    /**
     * Calculate the distance to the closest player.
     * @returns {Number} distance to closest player
     */
    getDistanceToPlayer() {
        if (this.closestPlayer == null) {
            return Infinity;
        }

        return this.position.distance(this.closestPlayer.position);
    }

    /**
     * Get the state tensor of an agent
     * return the map with walls, playerposition and currentposition
     * @returns {Array} state tensor
     */
    getStateTensor() {
        let agentCoordinates = this.level.getCoordinatesFromPosition(this.position);
        let closestPlayerCoordinates = this.closestPlayer == null ? Vector.zero() : this.level.getCoordinatesFromPosition(this.closestPlayer.position)
        
        return [...this.level.getCurrentMap(closestPlayerCoordinates, agentCoordinates)];
    }

    /**
     * Get the observation tensor of an agent
     * return the position of the agent, the position of the closest player, the angle of the agent and the velocity of the agent
     * @returns {Array} observation tensor
     */
    getObservationTensor() {
        let agentPosition = Vector.divide(this.position, new Vector(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT));
        let closestPlayerPosition = this.closestPlayer == null ? Vector.zero() : Vector.divide(this.position, new Vector(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT));
        let agentAngle = this.tankAngle / Math.PI;
        let velocity = this.velocity;

        return [...agentPosition.asArray, ...closestPlayerPosition.asArray, agentAngle, ...velocity.asArray];
    }

    isNextStateInWall(new_position) {
        return this.level.isPositionInWall(this.level.getCoordinatesFromPosition(new_position));
    }
}



module.exports = SimpleEnemy