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

        this.learning = false;
        this.layers = [32, 64, 32];
        this.numStates = this.level.getLevelPositionsTotal() + 3;
        this.numActions = 4;
        this.batchSize = 32;
        this.model = new Model(this.layers, this.numStates, this.numActions, this.batchSize, + this.learning);
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
            this.numStates = this.level.getLevelPositionsTotal() + 3;
            this.model = new Model(this.layers, this.numStates, this.numActions, this.batchSize, + this.learning);
            
            this.updateLevel();
            this.orchestrator = new Orchestrator(this.entityManagement.bots, this.model, this.level);
        }

        this.entityManagement.updateEntities(this.playerManagement.players.values(), this.level.gameWalls);
        this.playerManagement.removeCollidedPlayers();

        this.entityManagement.updateBots(this.playerManagement.players.values(), this.learning, this.orchestrator);
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
        if (data.saveWeights) {
            this.orchestrator.model.saveWeights();
        }
    }
}

module.exports = Game