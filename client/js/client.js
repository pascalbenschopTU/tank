const socket = io();

const Constants = require('../../lib/Constants');
const Game = require('./game/Game');

const game = Game.create(socket, 'canvas', 'textbox', 'console');

document.getElementById("splashscreen-input").focus()

var splashScreen = document.getElementById("splashscreen")
splashScreen.addEventListener('keyup', (event) => {
    if (event.key == "Enter") {
        splashScreen.style.opacity = 0;
        setTimeout(() => {
            splashScreen.classList.add('hidden')
        }, 210)

        socket.emit(Constants.SOCKET_NEW_PLAYER, event.target.value);
        game.run();
    }
})