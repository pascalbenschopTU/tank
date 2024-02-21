const Constants = require('../../../lib/Constants')
const Util = require('../../../lib/Util')

/**
 * Drawing class.
 */
class Drawing {
  /**
   * Constructor for the Drawing class.
   * @param {CanvasRenderingContext2D} context The canvas context to draw to
   * @param {Object<string, Image>} images The image assets for each entity
   * @param {Viewport} viewport The viewport class to translate from absolute
   *   world coordinates to relative cannon coordinates.
   */
  constructor(context, images, viewport) {
    this.context = context
    this.images = images
    this.viewport = viewport

    this.width = context.canvas.width
    this.height = context.canvas.height
  }

  /**
   * Factory method for creating a Drawing object.
   * @param {Element} canvas The canvas element to draw to
   * @param {Viewport} viewport The viewport object for coordinate translation
   * @return {Drawing}
   */
  static create(canvas, viewport) {
    const context = canvas.getContext('2d')
    const images = {}
    
    return new Drawing(context, images, viewport)
  }

  /**
   * Clears the canvas.
   */
  clear() {
    this.context.clearRect(0, 0, this.width, this.height)
  }

  /**
   * Draws a player to the canvas as a tank.
   * @param {boolean} isSelf If this is true, then a green tank will be draw
   *   to denote the player's tank. Otherwise a red tank will be drawn to
   *   denote an enemy tank.
   * @param {Player} player The player object to draw.
   */
  drawTank(isSelf, player) {
    var colour = Constants.DRAWING_ENEMY_COLOUR;
    if (isSelf) {
      colour = Constants.DRAWING_SELF_COLOUR;
    }
    if (player.name.includes("bot") && player.name.length == 14) {
      colour = Constants.DRAWING_BOT_COLOUR;
    }

    this.drawTankSkeleton(player, colour, 23, 31);
    this.drawTurret(player, colour, 7, 8, 15);
  }

  loadBulletImage() {
    var bullet = new Image();
    bullet.src = Constants.DRAWING_BULLET_PATH;

    return bullet;
  }

  /**
   * Draws a bullet (tank shell) to the canvas.
   * @param {Bullet} bullet The bullet to draw to the canvas
   */
  drawBullet(bullet, width, length) {
    // Original width = 15, length = 25
    this.context.save();
    this.context.translate(bullet.position.x, bullet.position.y);
    this.context.rotate(bullet.angle + Math.PI / 2);
    this.context.drawImage(this.loadBulletImage(), -7, 0, width, length);
    this.context.rotate(-bullet.angle + Math.PI / 2);
    this.context.translate(-bullet.position.x, bullet.position.y);

    this.context.restore()
  }


  /**
   * Draws a wall to canvas.
   * @param {Wall} wall 
   */
  drawWall(wall) {
    this.context.save();
    this.context.fillStyle = 'green';
    this.context.fillRect(wall.minX, wall.minY, wall.width, wall.height);
    this.context.restore();
  }


  /**
   * 
   * @param {Player} player 
   * @returns 
   */
   getTankSkeletonPolygon(player, width, length) {
    // original width = 23, length = 31
    var tankFi = Math.atan(width / length);
    var tankDg = Math.sqrt(length * length + width * width) / 2;
  
    var rotMinusFi = player.tankAngle - tankFi,
        rotPlusFi = player.tankAngle + tankFi;
    return {
        x: player.position.x,
        y: player.position.y,
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
  
  /**
   * Draws a tank skeleton to the canvas.
   * @param {Player} player 
   * @param {string} colour 
   * @param {number} width 
   * @param {number} length 
   */
  drawTankSkeleton(player, colour, width, length) {
    this.context.save();

    var skPoly = this.getTankSkeletonPolygon(player, width, length);
    this.context.beginPath();
    for(var i = 0, plen = skPoly.points.length; i < plen; i++) {
      var pFunc = (i === 0) ? this.context.moveTo : this.context.lineTo;
      pFunc.call(this.context, skPoly.x + skPoly.points[i].x, skPoly.y + skPoly.points[i].y);
    }
    this.context.closePath();
    this.context.strokeStyle = "#000";
    this.context.fillStyle = colour;
    this.context.stroke();
    this.context.fill();

    // Draw name above tank skeleton
    this.context.fillStyle = "#000";
    this.context.font = "bold 12px Arial";
    this.context.textAlign = "center";
    this.context.fillText(player.name, player.position.x, player.position.y - 20);

    this.context.restore();
  }
  
  
  drawTurret(player, colour, diameter, width, length) {
      // original radius = 7/2, widht = 8, length = 15
      var turAngle = player.turretAngle;
      var alpha = Math.asin(diameter/2 / width),
          beta = Math.atan(diameter/2 / (width + length)),
          startAngle = turAngle + alpha,
          endAngle = turAngle + 2 * Math.PI - alpha;
      this.context.beginPath();
      this.context.arc(player.position.x, player.position.y, width, startAngle, endAngle, false);
      this.context.lineTo(player.position.x + (width + length) * Math.cos(turAngle - beta), player.position.y + (width + length) * Math.sin(turAngle - beta));
      this.context.lineTo(player.position.x + (width + length) * Math.cos(turAngle + beta), player.position.y + (width + length) * Math.sin(turAngle + beta));
      this.context.closePath();
      
      this.context.strokeStyle = "#000";
      this.context.fillStyle = colour;
      this.context.stroke();
      this.context.fill();
  }
  
}

module.exports = Drawing