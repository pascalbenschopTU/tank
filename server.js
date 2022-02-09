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

const game = Game.create(); //new Game();


app.set('port', Constants.PORT);
app.use('/client', express.static(path.join(__dirname, '/client')));
app.use('/dist', express.static(path.join(__dirname, '/dist')))
// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'view/index.html'));
});




io.on('connection', socket => {
  socket.on(Constants.SOCKET_NEW_PLAYER, (data, callback) => {
    game.addnewPlayer("kek", socket);
    //callback();
  })

  socket.on(Constants.SOCKET_RESET, () => {
    game.reset();
  })

  socket.on(Constants.SOCKET_PLAYER_ACTION, data => {
    game.updatePlayerOnInput(socket.id, data);
  })

  socket.on(Constants.SOCKET_DISCONNECT, () => {
    game.removePlayer(socket.id);
  })
});

setInterval(() => {
  game.update()
  game.sendState()
}, 1000 / 60);


server.listen(Constants.PORT, function() {
  console.log('Starting server on port 5000');
});





// var bulletspeed = 6;

// var players = {};
// var bulletMap = {};
// io.on('connection', function(socket) {
//   socket.on('disconnect', function() {
//       delete players[socket.id];
//       delete bulletMap[socket.id];
//   });
//   socket.on('new player', function() {
//     players[socket.id] = {
//       x: 300,
//       y: 300
//     };
//     bulletMap[socket.id] = {
//         bullets: []
//     }
//   });

  

//   socket.on('movement', function(data) {
//     var player = players[socket.id] || {};
//     if (data.left) {
//       player.x -= 5;
//     }
//     if (data.up) {
//       player.y -= 5;
//     }
//     if (data.right) {
//       player.x += 5;
//     }
//     if (data.down) {
//       player.y += 5;
//     }
//   });
//   socket.on('bullets', function(data) {
//         // retrieve bullets from tank with this socket, add them to total bullets.
//         var BM = bulletMap[socket.id] || {};
//         BM.bullets = data.bullets;
//         // update state of bullets.
//         if (BM.bullets != null) {
//             updateBullets(BM.bullets);
//         }
//   });
// });
// setInterval(function() {
//   io.sockets.emit('state', players, bulletMap);
// }, 1000 / 60);


// function shiftBullet(b) {
// 	b.x += bulletspeed * Math.cos(b.pitch);
// 	b.y += bulletspeed * Math.sin(b.pitch);
//     // if bullet bounces more than 1 time dont bounce.
//     if (b.du > 0) {
//         if(b.x <= 0 || b.x >= 1600) {
//             b.pitch = Math.PI - b.pitch;
//             b.du -= 1;
//         }
//         if(b.y <= 0 || b.y >= 1000) {
//             b.pitch = - b.pitch;
//             b.du -= 1;
//         } 
//     }
// }

// function updateBullets(bullets) {
// 	for(var i = bullets.length - 1; i >= 0; i--) {
// 		if(bullets[i].du <= 0) {
// 			bullets.splice(i, 1);
// 			continue;
// 		}
// 		shiftBullet(bullets[i]);
// 	}

//     return bullets;
// }