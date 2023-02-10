const Drawing = require('./Drawing')
const Input = require('./Input')
//const Leaderboard = require('./Leaderboard')
const Viewport = require('./Viewport')

const Constants = require('../../../lib/Constants')
const Vector = require('../../../lib/Vector')
const Util = require('../../../lib/Util')
const Leaderboard = require('./Leaderboard')

/**
 * Game class.
 */
class Game {
  /**
   * Creates a Game class.
   * @param {Socket} socket The socket connected to the server
   * @param {Viewport} viewport The Viewport object for coordinate translation
   * @param {Drawing} drawing The Drawing object for canvas rendering
   * @param {Input} input The Input object for tracking user input
   * @param {Leaderboard} leaderboard The Leaderboard object handling the
   *   leaderboard update
   */
  constructor(socket, viewport, drawing, input, leaderboard) {
    this.socket = socket

    this.viewport = viewport
    this.drawing = drawing
    this.input = input
    this.leaderboard = leaderboard

    this.self = null
    this.players = []
    this.projectiles = []
    this.walls = []

    this.animationFrameId = null
    this.lastUpdateTime = 0
    this.deltaTime = 0
  }

  /**
   * Factory method for creating a Game class instance.
   * @param {Socket} socket The socket connected to the server
   * @param {string} canvasElementID The ID of the canvas element to render the
   *   game to
   * @return {Game}
   */
  static create(socket, canvasElementID, textboxElementID) {
    const canvas = document.getElementById(canvasElementID)
    canvas.width = Constants.CANVAS_WIDTH // = document.documentElement.clientWidth * 0.6
    canvas.height = Constants.CANVAS_HEIGHT //= document.documentElement.clientHeight * 0.7

    const textbox = document.getElementById(textboxElementID)
    
    const viewport = Viewport.create(canvas)
    const drawing = Drawing.create(canvas, viewport)
    const input = Input.create(document, canvas)
    const leaderboard = Leaderboard.create(textbox)

    const game = new Game(socket, viewport, drawing, input, leaderboard)
    game.init()
    return game
  }

  /**
   * Initializes the Game object and binds the socket event listener.
   */
  init() {
    this.lastUpdateTime = Date.now()
    this.socket.on(Constants.SOCKET_UPDATE,
      this.onReceiveGameState.bind(this));
    this.socket.on(Constants.SOCKET_MAP_UPDATE,
      this.onReceiveGameMap.bind(this));
  }

  /**
   * Socket event handler.
   * @param {Object} state The game state received from the server
   */
  onReceiveGameState(state) {
    this.self = state.self
    this.players = state.players
    this.projectiles = state.projectiles

    this.leaderboard.update(this.players)
  }

  onReceiveGameMap(state) {
    this.walls = state.walls;
  }

  /**
   * Starts the animation and update loop to run the game.
   */
  run() {
    const currentTime = Date.now()
    this.deltaTime = currentTime - this.lastUpdateTime
    this.lastUpdateTime = currentTime

    this.update()
    this.draw()
    this.animationFrameId = window.requestAnimationFrame(this.run.bind(this))
  }

  /**
   * Stops the animation and update loop for the game.
   */
  stop() {
    window.cancelAnimationFrame(this.animationFrameId)
  }

  reset() {
    this.socket.emit(Constants.SOCKET_RESET, {});
  }

  /**
   * Updates the client state of the game and sends user input to the server.
   */
  update() {
    if (this.self) {
      //this.viewport.update(this.deltaTime)

      const absoluteMouseCoords = this.viewport.toCanvas(
        Vector.fromArray(this.input.mouseCoords));

      const playerToMouseVector = Vector.sub(absoluteMouseCoords, this.self.position);

      this.socket.emit(Constants.SOCKET_PLAYER_ACTION, {
        up: this.input.up,
        down: this.input.down,
        left: this.input.left,
        right: this.input.right,
        shoot: this.input.mouseDown,
        turretAngle: Util.normalizeAngle(playerToMouseVector.angle)
      })
    }
  }

  /**
   * Draws the state of the game to the canvas.
   */
  draw() {
    if (this.self) {
      this.drawing.clear()

      this.projectiles.forEach(projectile => this.drawing.drawBullet(projectile, 15, 25))

      this.players.forEach(tank => this.drawing.drawTank(false, tank))
      this.drawing.drawTank(true, this.self)
      this.walls.forEach(wall => this.drawing.drawWall(wall));
    }
  }
}

module.exports = Game