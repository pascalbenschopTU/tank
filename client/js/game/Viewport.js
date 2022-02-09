const Constants = require('../../../lib/Constants')
const Entity = require('../../../lib/Entity')
const Vector = require('../../../lib/Vector')

/**
 * Viewport class.
 */
class Viewport {
  /**
   * Constructor for a Viewport object. The position of the viewport will hold
   * the absolute world coordinates for the top left of the view (which
   * correspond to canvas coordinates [width / 2, height / 2]).
   * @param {Vector} position The starting position of the viewport
   * @param {Vector} velocity The starting velocity of the viewport
   * @param {number} canvasWidth The width of the canvas for this viewport
   * @param {number} canvasHeight The height of the canvas for this viewport
   */
  constructor(position, canvasWidth, canvasHeight) {
    this.canvasOffset = new Vector(canvasWidth / 2, canvasHeight / 2)
    this.position = position;
  }

  /**
   * Create a Viewport object.
   * @param {Element} canvas The canvas element this viewport represents
   * @return {Viewport}
   */
  static create(canvas) {
    var rect = canvas.getBoundingClientRect();
    return new Viewport(
      new Vector(rect.left, rect.top), 
      canvas.width, 
      canvas.height
      )
  }

  /**
   * Converts an absolute world coordinate to a position on the canvas in this
   * viewport's field of view.
   * @param {Vector} position The absolute world coordinate to convert.
   * @return {Vector}
   */
  toCanvas(position) {
    return Vector.sub(position, this.position)
  }
}

module.exports = Viewport