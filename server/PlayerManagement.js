const Player = require("./entities/Player");
const Constants = require('../lib/Constants');

class PlayerManagement {

    constructor() {
        this.clients = new Map();
        this.players = new Map();
        this.totalPlayers = 0;
        this.projectiles = []
    }

    /**
     * Add players to the game based on the player positions.
     * @param {Array} playerPositions 
     */
    addPlayersToGame(playerPositions, walls) {
        this.clients.forEach((clientObject, socketID) => {
            this.addnewPlayer(clientObject.name, clientObject.socket, playerPositions, walls);
        });
    }

    /**
     * Add a new player and send map.
     * @param {String} name 
     * @param {Object} socket 
     */
    addnewPlayer(name, socket, playerPositions, walls) {
        if (this.totalPlayers > playerPositions.length - 1) {
            this.totalPlayers = 0;
        }

        this.clients.set(socket.id, {socket: socket, name: name});
        this.players.set(socket.id, Player.create(
            playerPositions[this.totalPlayers],
            name, 
            socket.id
        ));

        this.sendMap(walls);

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
     * Remove collided players.
     */
    removeCollidedPlayers() {
        this.players = new Map([...this.players].filter(([key, player]) => !player.destroyed))
    }

    /**
     * Clear all players from the game.
     */
    clearPlayers() {
        this.players.clear();
    }

    /**
     * Updates the player with the given socket ID according to the input state
     * object sent by the player's client.
     * @param {string} socketID The socket ID of the player to update
     * @param {Object} data The player's input state
     * @returns the projectiles fired by the player
     */
    updatePlayerAndProjectiles(socketID, data) {
        let projectiles = []
        const player = this.players.get(socketID)
        if (player) {
            player.updateOnInput(data)
            if (data.shoot && player.canShoot()) {
                projectiles = player.getProjectilesFromShot()
            }
        }

        return projectiles
    }

    /**
     * Sends the state of the game to all connected players.
     */
    emitGameDataToClients(bots, projectiles) {
        const players = [...this.players.values()]

        this.clients.forEach((clientObject, socketID) => {
            if (this.players.has(socketID)) {
                const currentPlayer = this.players.get(socketID)
                clientObject.socket.emit(Constants.SOCKET_UPDATE, {
                    self: currentPlayer,
                    players: players,
                    bots: bots,
                    projectiles: projectiles
                })
            }
        })
    }

    /**
     * Send a message to all connected players.
     * @param {Object} data 
     */
    emitMessage(data) {
        this.playerManagement.clients.forEach((clientObject, socketID) => {
            if (this.playerManagement.players.has(socketID)) {
                const currentPlayer = this.playerManagement.players.get(socketID);
                clientObject.socket.emit(Constants.SOCKET_MESSAGE, data);
            }
        })
    }

    /**
     * Sends the state of the game to all connected players.
     */
    sendMap(walls) {
        this.clients.forEach((clientObject, socketID) => {
            if (this.players.has(socketID)) {
                clientObject.socket.emit(Constants.SOCKET_MAP_UPDATE, {
                    walls: walls
                })
            }
        })
    }
}

module.exports = PlayerManagement