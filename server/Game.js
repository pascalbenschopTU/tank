const Bullet = require("./entities/Bullet");
const Player = require("./entities/Player");
const Constants = require('../lib/Constants');
const Level = require("./Level");
const SimpleEnemy = require("./entities/SimpleEnemy");
const Model = require('../lib/AI/QLearning')
const Memory = require('../lib/AI/Memory');
const Orchestrator = require("../lib/AI/Orchestrator");


class Game {

    /**
     * Constructor
     */
    constructor() {
        this.clients = new Map();

        this.players = new Map();
        this.totalPlayers = 0;

        this.level = new Level();

        this.layers = 4;
        this.num_states = 4;
        this.num_actions = 4;
        this.batch_size = 100;
        this.model = new Model(this.layers, this.num_states, this.num_actions, this.batch_size);
        this.memory = new Memory(1000);

        this.orchestrator = new Orchestrator(this.model, this.memory);

        this.bots = [];
        this.walls = [];
        this.playerPositions = [];
        this.projectiles = [];
        
        this.lastUpdateTime = 0;
        this.deltaTime = 0;
    }



    /**
     * Creates a game object.
     * @return {Game}
     */
    static create() {
        const game = new Game();
        game.init();

        return game;
    }

    /**
     * Initializes game state.
     */
    init() {
        this.lastUpdateTime = Date.now();

        this.updateLevel();
    }

    /**
     * Reset bots.
     */
    reset() {
        this.init();
    }

    /**
     * Add a new player and send map.
     * @param {String} name 
     * @param {Object} socket 
     */
    addnewPlayer(name, socket) {
        if (this.totalPlayers > this.playerPositions.length - 1) {
            this.totalPlayers = 0;
        }

        this.clients.set(socket.id, socket);
        this.players.set(socket.id, Player.create(
            this.playerPositions[this.totalPlayers],
            name, 
            socket.id
        ));

        this.sendMap();

        this.totalPlayers++;
    }


    /**
   * Removes the player with the given socket ID and returns the name of the
   * player removed.
   * @param {string} socketID The socket ID of the player to remove.
   * @return {string}
   */
    removePlayer(socketID) {
        if (this.totalPlayers > 0) {
            this.totalPlayers--;
        }
        
        if (this.clients.has(socketID)) {
            this.clients.delete(socketID)
        }
        if (this.players.has(socketID)) {
            const player = this.players.get(socketID)
            this.players.delete(socketID)
            return player.name
        }
    }

    /**
     * Updates the player with the given socket ID according to the input state
     * object sent by the player's client.
     * @param {string} socketID The socket ID of the player to update
     * @param {Object} data The player's input state
     */
    updatePlayerOnInput(socketID, data) {
        const player = this.players.get(socketID)
        if (player) {
            player.updateOnInput(data)
            if (data.shoot && player.canShoot()) {
                const projectiles = player.getProjectilesFromShot()
                this.projectiles.push(...projectiles)
            }
        }
    }

    /**
     * Updates the state of all the objects in the game.
     */
    update() {
        if (this.bots.length == 0) {
            this.updateLevel();
        }

        const currentTime = Date.now()
        this.deltaTime = currentTime - this.lastUpdateTime
        this.lastUpdateTime = currentTime

        /**
         * Perform a physics update and collision update for all entities
         * that need it.
         */
        const entities = [
            ...this.players.values(),
            ...this.projectiles
        ]

        entities.forEach(entity => { entity.update(this.lastUpdateTime, this.deltaTime, this.walls) })

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

        /**
         * Filters out destroyed projectiles and powerups.
         */
        this.projectiles = this.projectiles.filter(projectile => !projectile.destroyed)
        var keyToRemove = -100;
        for (let [key, player] of this.players) {
            if (player.destroyed) {
                keyToRemove = key;
                if (player.name == Constants.BOT_NAME) {
                    this.bots.splice(key, 1);
                }
            }
        }

        this.players.delete(keyToRemove);
    }

    /**
     * Update the level to the next level.
     */
    updateLevel() {
        this.clearLevel();

        this.syncDelay(500);

        this.level.updateCurrentLevel();
        this.bots = this.level.gameBots.map(position => new SimpleEnemy(position, this.level));
        this.walls = this.level.gameWalls;
        this.playerPositions = this.level.gamePlayerPositions;

        this.clients.forEach((client, socketID) => {
            this.addnewPlayer(Constants.PLAYER_NAME, this.clients.get(socketID));
        });

        for (let i = 0; i < this.bots.length; i++) {
            this.players.set(i, this.bots[i]);
        }
    }

    /**
     * Clear the level.
     */
    clearLevel() {
        this.players.clear();
        this.bots = [];
        this.walls = [];
        this.playerPositions = [];
    }

    /**
     * Sends the state of the game to all connected players.
     */
    sendState() {
        const players = [...this.players.values()]

        this.updateBots(players, this.projectiles);

        this.clients.forEach((client, socketID) => {
            if (this.players.has(socketID)) {
                const currentPlayer = this.players.get(socketID)
                this.clients.get(socketID).emit(Constants.SOCKET_UPDATE, {
                    self: currentPlayer,
                    players: players,
                    projectiles: this.projectiles
                })
            }
        })
    }

    /**
     * Updates bot based on players and projectiles.
     * @param {Array<Player>} players 
     * @param {Array<Bullet>} projectiles 
     */
    updateBots(players, projectiles) {
        for (let i = 0; i < this.bots.length; i++) {
            const bot = this.bots[i];
            bot.updateOnPlayerInput(players, this.level);
            if (bot.canShoot(this.walls)) {
                const botProjectiles = bot.getProjectilesFromShot()
                projectiles.push(...botProjectiles)
            }
        }
    }

    updateBotAI() {
        this.orchestrator.updateAgents(this.bots);
    }

    /**
     * Sends the state of the game to all connected players.
     */
     sendMap() {
        this.clients.forEach((client, socketID) => {
            if (this.players.has(socketID)) {
                this.clients.get(socketID).emit(Constants.SOCKET_MAP_UPDATE, {
                    walls: this.walls
                })
            }
        })
    }


    syncDelay(milliseconds){
        var start = new Date().getTime();
        var end=0;
        while( (end-start) < milliseconds){
            end = new Date().getTime();
        }
       }
}

module.exports = Game