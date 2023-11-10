// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);


const Game = require('./server/Game');

const Constants = require('./lib/Constants');

const game = new Game();


app.set('port', Constants.PORT);

// Allow static content to be served
app.use('/client', express.static(path.join(__dirname, '/client')));
app.use('/dist', express.static(path.join(__dirname, '/dist')));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname + '/client/view/index.html'));
});




io.on('connection', socket => {
  socket.on(Constants.SOCKET_NEW_PLAYER, (data) => {
    game.addnewPlayer(data, socket);
  })

  socket.on(Constants.SOCKET_PLAYER_ACTION, data => {
    game.updateOnPlayerInput(socket.id, data);
  })

  socket.on(Constants.SOCKET_DEBUG_INFO, data => {
    game.processDebugInfo(data);
  })

  socket.on(Constants.SOCKET_MESSAGE, data => {
    game.sendMessage(data);
  })

  socket.on(Constants.SOCKET_DISCONNECT, () => {
    game.removePlayer(socket.id);
  })
});

setInterval(() => {
  game.update()
}, 1000 * Constants.Player_UPDATE_RATE);



server.listen(Constants.PORT, function() {
  console.log('Starting server on port %s', Constants.PORT);
});