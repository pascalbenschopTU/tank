const socket = io();

const Game = require('./game/Game');

const game = Game.create(socket, 'canvas');
socket.emit('new-player');
game.run();


document.getElementById("reset-button").onclick = function() {
    game.reset();
}
