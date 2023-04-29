const Level = require("./level/Level");
const SimpleEnemy = require("./entities/SimpleEnemy");
const Model = require('../lib/AI/NeuralNetwork')
const Memory = require('../lib/AI/Memory');
const Orchestrator = require("../lib/AI/Orchestrator");
const PlayerManagement = require("./PlayerManagement")
const EntityManagement = require("./EntityManagement")

class Game {

    /**
     * Constructor
     */
    constructor() {
        this.level = new Level();
        this.playerManagement = new PlayerManagement();
        this.entityManagement = new EntityManagement();

        this.learning = true;
        this.layers = [128, 128];
        this.num_states = 7;
        this.num_actions = 4;
        this.batch_size = 128;
        this.model = new Model(this.layers, this.num_states, this.num_actions, this.batch_size, + this.learning);
        this.memory = new Memory(10000);
        this.orchestrator;
    }

    addnewPlayer(name, socket) {
        this.playerManagement.addnewPlayer(name, socket, this.level.gamePlayerPositions, this.level.gameWalls);
    }

    removePlayer(socketID) {
        this.playerManagement.removePlayer(socketID);
    }

    updateOnPlayerInput(socketID, data) {
        var projectiles = this.playerManagement.updatePlayerAndProjectiles(socketID, data);
        this.entityManagement.addProjectiles(projectiles);
    }

    /**
     * Updates the state of all the objects in the game.
     */
    update() {
        if (this.entityManagement.bots.length == 0) {
            this.updateLevel();
            this.orchestrator = new Orchestrator(this.entityManagement.bots, this.model, this.memory);
        }

        this.entityManagement.updateEntities(this.playerManagement.players.values(), this.level.gameWalls);
        this.playerManagement.removeCollidedPlayers();

        this.entityManagement.updateBots(this.playerManagement.players, this.learning, this.orchestrator);
        this.playerManagement.emitGameDataToClients(this.entityManagement.bots, this.entityManagement.projectiles);
    }

    /**
     * Update the level to the next level.
     */
    updateLevel() {
        this.playerManagement.clearPlayers()
        this.entityManagement.clearBots()

        this.level.updateCurrentLevel();

        this.playerManagement.addPlayersToGame(this.level.gamePlayerPositions, this.level.gameWalls);
        this.entityManagement.addBots(this.level);
    }

    sendMessage(data) {
        // Add player name to message
        data.message = this.playerManagement.players.get(data.socket_id).name + ": " + data.message;

        this.playerManagement.emitMessage(data);
    }

    /**
     * Process debug info from socket
     * @param {Object} data 
     */
    processDebugInfo(data) {
        if (data.toggleTraining) { 
            this.learning = !this.learning;
        }
        if (data.level >= 0) {
            if (data.level < this.level.getAmountOfLevels()) {
                this.clearLevel();
                this.level.makeLevel(data.level);
            }
        }
    }
}

module.exports = Game