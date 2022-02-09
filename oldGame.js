const Constants = require("../lib/Constants");


var socket = io();
socket.emit('new player');
setInterval(function() {
  socket.emit('movement', movement);
  socket.emit('bullets', bulletObject);
}, 1000 / 60);


var canvas = document.getElementById('canvas');
var mousex = 0;
var mousey = 0;
canvas.width = 1600;
canvas.height = 1000;
var c = canvas.getContext('2d');
socket.on('state', function(players, bulletMap) {
  c.clearRect(0, 0, 1600, 1000);
  canvas.style.cursor = 'crosshair';
  for (var id in players) {
    var player = players[id];
    var rot = getRotation(player);

    drawTank(rot, player.x, player.y);
  }
  // re update bullets to given bulletMap or null.
  var BM = bulletMap[socket.id] || {};
  bulletObject.bullets = BM.bullets;
  serveBullets(bulletMap);
});

document.body.addEventListener("mousemove", function (e) {
    var rect = canvas.getBoundingClientRect();
    mousex = (e.clientX - rect.left) * (canvas.width / rect.width);
    mousey = (e.clientY - rect.top) * (canvas.height / rect.height);
    
});

function getRotation(player) {
    var fireX = mousex - player.x;
    var fireY = mousey - player.y;
    var angle = Math.atan2(fireY, fireX);
    var rot = normalizeRot(angle);

    return rot;
}

function normalizeRot(rot) {// converts angle to its equivalent from interval [-pi; pi]
	return rot - (2 * Math.PI) * Math.floor((rot + Math.PI) / (2 * Math.PI));
}



// Game logic

var bulletObject = {
    bullets: []
}
document.body.addEventListener("click", function(e) {
    if (bulletObject.bullets.length < 5) {
        var b = fireBullet(tank.turret);

        bulletObject.bullets.push(b);
    }
});


var movement = {
    up: false,
    down: false,
    left: false,
    right: false
  }
  document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = true;
        break;
      case 87: // W
        movement.up = true;
        break;
      case 68: // D
        movement.right = true;
        break;
      case 83: // S
        movement.down = true;
        break;
    }
  });
  document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = false;
        break;
      case 87: // W
        movement.up = false;
        break;
      case 68: // D
        movement.right = false;
        break;
      case 83: // S
        movement.down = false;
        break;
    }
  });


// tank logic

var tank = {
	x: 25,// rotate origin (centre)
	y: 200,
	w: 31,
	h: 23,
	rot: 0,
	speed: 1,
	rSpeed: Math.PI / 90,
	turret: {
		x: 25,
		y: 200,
		rot: 0,
		r: 8,
		w: 7,
		l: 15
	},
	destroyed: false
},
tankFi = Math.atan(tank.h / tank.w),
tankDg = Math.sqrt(tank.w * tank.w + tank.h * tank.h) / 2;

var turret = {
	sightRadius: 100,
	rSpeed: Math.PI / 180,
	fireTimeout: 300,
	color: "#0082f3"
};

function fireBullet(tur) {
    var b = {
        x: tur.x + Math.cos(tur.rot) * (tur.r + tur.l),
        y: tur.y + Math.sin(tur.rot) * (tur.r + tur.l),
        pitch: tur.rot,
        du: 2
    };
    return b;
}


function getTankSkeletonPolygon() {
	var rotMinusFi = tank.rot - tankFi,
		rotPlusFi = tank.rot + tankFi;
	return {
		x: tank.x,
		y: tank.y,
		points: [
			{
				x: Math.cos(rotMinusFi) * tankDg,
				y: Math.sin(rotMinusFi) * tankDg
			},
			{
				x: Math.cos(rotPlusFi) * tankDg,
				y: Math.sin(rotPlusFi) * tankDg
			},
			{
				x: Math.cos(rotMinusFi + Math.PI) * tankDg,
				y: Math.sin(rotMinusFi + Math.PI) * tankDg
			},
			{
				x: Math.cos(rotPlusFi + Math.PI) * tankDg,
				y: Math.sin(rotPlusFi + Math.PI) * tankDg
			}
		]
	};
}



function drawTankSkeleton() {
	var skPoly = getTankSkeletonPolygon();
	c.beginPath();
	for(var i = 0, plen = skPoly.points.length; i < plen; i++) {
		var pFunc = (i === 0) ? c.moveTo : c.lineTo;
		pFunc.call(c, skPoly.x + skPoly.points[i].x, skPoly.y + skPoly.points[i].y);
	}
	c.closePath();
	c.strokeStyle = "#000";
	c.fillStyle = "#0062b6";
	c.stroke();
	c.fill();
}


function drawTurret(tur) {
	var alpha = Math.asin(tur.w/2 / tur.r),
		beta = Math.atan(tur.w/2 / (tur.r + tur.l)),
		startAngle = tur.rot + alpha,
		endAngle = tur.rot + 2 * Math.PI - alpha;
	c.beginPath();
	c.arc(tur.x, tur.y, tur.r, startAngle, endAngle, false);
	c.lineTo(tur.x + (tur.r + tur.l) * Math.cos(tur.rot - beta), tur.y + (tur.r + tur.l) * Math.sin(tur.rot - beta));
	c.lineTo(tur.x + (tur.r + tur.l) * Math.cos(tur.rot + beta), tur.y + (tur.r + tur.l) * Math.sin(tur.rot + beta));
	c.closePath();
	
	c.strokeStyle = "#000";
	c.fillStyle = tur.color || turret.color;
	c.stroke();
	c.fill();
}

function drawTank(rot, x, y) {
    tank.x = x;
    tank.y = y;
    tank.turret.x = x;
    tank.turret.y = y;
    tank.turret.rot = rot;
	drawTankSkeleton();
	drawTurret(tank.turret);
}

function loadBulletImage() {
    var bullet = new Image();
    bullet.src = Constants.DRAWING_BULLET_PATH;

    return bullet;
}


function drawBullet(b) {
    c.save();
	  c.beginPath();
    c.translate(b.x, b.y);
    c.rotate(b.pitch);
    c.drawImage(loadBulletImage(), 0, 0, 20, 5);
    c.rotate(-b.pitch);
    c.translate(-b.x, -b.y);
    c.restore();
}


function serveBullets(bulletMap) {
    for (var id in bulletMap) {
        var currentBullets = bulletMap[id].bullets;
        if (currentBullets != null) {
            for(var i = 0; i < currentBullets.length; i++) {
                drawBullet(currentBullets[i]);
            }
        }
    }
}