const Drawing = require('./Drawing')
const Input = require('./Input')
const Console = require("./Console")
const Viewport = require('./Viewport')

const Constants = require('../../../lib/Constants')
const Vector = require('../../../lib/Vector')
const Util = require('../../../lib/Util')
const TextBox = require('./TextBox')

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
   * @param {Leaderboard} textbox The Leaderboard object handling the
   *   leaderboard update
   */
  constructor(socket, viewport, drawing, input, textbox, console) {
    this.socket = socket

    this.viewport = viewport
    this.drawing = drawing
    this.input = input
    this.textbox = textbox
    this.console = console

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
  static create(socket, canvasElementID, textboxElementID, consoleElementID) {
    const canvas = document.getElementById(canvasElementID)
    canvas.width = Constants.CANVAS_WIDTH // = document.documentElement.clientWidth * 0.6
    canvas.height = Constants.CANVAS_HEIGHT //= document.documentElement.clientHeight * 0.7

    const viewport = Viewport.create(canvas)
    const drawing = Drawing.create(canvas, viewport)
    const input = Input.create(document, canvas)
    const textbox = TextBox.create(document.getElementById(textboxElementID))
    const console = Console.create(document.getElementById(consoleElementID), textbox, socket)

    const game = new Game(socket, viewport, drawing, input, textbox, console)
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

    //this.textbox.update(this.players)
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

  /**
   * Reset the game
   */
  reset() {
    this.socket.emit(Constants.SOCKET_RESET, {});
  }

  /**
   * Updates the client state of the game and sends user input to the server.
   */
  update() {
    if (this.self) {
      const absoluteMouseCoords = this.viewport.toCanvas(
        Vector.fromArray(this.input.mouseCoords));

      const playerToMouseVector = Vector.sub(absoluteMouseCoords, this.self.position);

      if (document.getElementById("console") !== document.activeElement) {
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