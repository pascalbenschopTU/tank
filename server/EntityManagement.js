const Bullet = require("./entities/Bullet");
const Player = require("./entities/Player");
const SimpleEnemy = require("./entities/SimpleEnemy");
const Level = require("./level/Level");

class EntityManagement {

    constructor() {
        this.lastUpdateTime = Date.now()
        this.projectiles = []
        this.bots = []
    }

    /**
     * Add projectiles to the game
     * @param {Bullet[]} projectiles 
     */
    addProjectiles(projectiles) {
        this.projectiles.push(...projectiles)
    }

    /**
     * Add bots from the level to the game
     * @param {Level} level 
     */
    addBots(level) {
        this.bots.push(...level.gameBotPositions.map(position => new SimpleEnemy(position, level)))
    }

    /**
     * Clear all bots from the game
     */
    clearBots() {
        this.bots.length = 0;
    }

    /**
     * Update all entities in the game
     * @param {Array} players 
     */
    updateEntities(players, walls) {
        const currentTime = Date.now()
        this.deltaTime = currentTime - this.lastUpdateTime
        this.lastUpdateTime = currentTime

        const entities = [...players, ...this.bots, ...this.projectiles]

        entities.forEach(entity => { entity.update(this.lastUpdateTime, this.deltaTime, walls) })

        this.checkEntityCollisions(entities)
        this.removeCollidedEntities();
    }

    /**
     * Check for each entity whether it has collided with another entity
     * @param {Array} entities 
     */
    checkEntityCollisions(entities) {
        for (let i = 0; i < entities.length; ++i) {
            for (let j = i + 1; j < entities.length; ++j) {
                let e1 = entities[i]
                let e2 = entities[j]
                if (!e1.collided(e2)) {
                    continue
                }

                // Player-Bullet collision interaction
                if (e1 instanceof Bullet && e2 instanceof Player) {
                    e1 = entities[j]
                    e2 = entities[i]
                }
                if (e1 instanceof Player && e2 instanceof Bullet) {
                    if (e2.source != e1) {
                        e1.deaths++
                        e2.source.kills++
                        e1.destroyed = true;
                        e2.destroyed = true;
                        console.log("kill");
                        e2.source.bullets += 1;
                    }
                }

                // Bullet-Bullet interaction
                if (e1 instanceof Bullet && e2 instanceof Bullet) {
                    e1.destroyed = true
                    e2.destroyed = true
                    e1.source.bullets += 1;
                    e2.source.bullets += 1;
                }
            }
        }
    }

    /**
     * Remove collided entities
     */
    removeCollidedEntities() {
        this.projectiles = this.projectiles.filter(projectile => !projectile.destroyed)
        this.bots = this.bots.filter(bot => !bot.destroyed)
    }

    /**
     * Updates bot based on players and projectiles.
     * @param {Array<Player>} players
     * @param {Boolean} learning
     * @param {Orchestrator} orchestrator
     */
    updateBots(players, learning, orchestrator) {
        const playerArray = [...players]
        this.bots.forEach(bot => bot.updateBotsOnPlayers(playerArray, this.level))
        if (learning) {
            orchestrator.trainAgents()
        } else {
            this.projectiles = this.projectiles.concat(orchestrator.updateAgents())
        }
    }
}

module.exports = EntityManagement