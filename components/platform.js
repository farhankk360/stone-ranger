/**
 * Factory function to create platform objects with collision detection
 * @param {number} w - Platform width
 * @param {number} h - Platform height
 * @param {number} x - Platform x position
 * @param {number} y - Platform y position
 * @param {Object} config - Optional configuration for moving platforms
 * @param {boolean} config.isMoving - Whether this platform moves
 * @param {number} config.moveDistance - Distance to move from start position
 * @param {number} config.speed - Movement speed (default: 1)
 * @param {string} config.moveDirection - 'horizontal' or 'vertical' (default: 'horizontal')
 * @returns {Object} Platform object with drawPlatform, isContact, and update methods
 */
function Platform(w, h, x, y, config = {}) {
  const platform = {
    w: w,
    h: h,
    x: x,
    y: y,
    startX: x,
    startY: y,

    // Movement properties
    isMoving: config.isMoving || false,
    moveDistance: config.moveDistance || 100,
    speed: config.speed || 1,
    moveDirection: config.moveDirection || "horizontal",
    direction: 1, // 1 for positive direction, -1 for negative
  }

  // Generate random stones for texture (done once at creation)
  const stones = []
  for (let i = 0; i < 15; i++) {
    stones.push({
      x: Math.random() * (platform.w - 34) + 10, // Relative to platform
      y: Math.random() * (platform.h - 34) + 10, // Relative to platform
      w: Math.random() * 12 + 12,
      h: Math.random() * 12 + 12,
    })
  }

  /**
   * Updates platform position if it's a moving platform
   * @returns {Object} Movement delta {deltaX, deltaY} for entities to follow
   */
  platform.update = function () {
    if (!this.isMoving) return { deltaX: 0, deltaY: 0 }

    const oldX = this.x
    const oldY = this.y

    if (this.moveDirection === "horizontal") {
      const nextX = this.x + this.speed * this.direction

      // Check bounds and reverse direction
      if (
        nextX >= this.startX + this.moveDistance ||
        nextX <= this.startX - this.moveDistance
      ) {
        this.direction *= -1
      } else {
        this.x = nextX
      }
    } else if (this.moveDirection === "vertical") {
      const nextY = this.y + this.speed * this.direction

      // Check bounds and reverse direction
      if (
        nextY >= this.startY + this.moveDistance ||
        nextY <= this.startY - this.moveDistance
      ) {
        this.direction *= -1
      } else {
        this.y = nextY
      }
    }

    // Return movement delta for entities to follow
    return {
      deltaX: this.x - oldX,
      deltaY: this.y - oldY,
    }
  }

  /**
   * Draws the platform with grass texture and stone details
   */
  platform.drawPlatform = function () {
    push()

    // Draw main platform body
    fill(124, 75, 43)
    rect(this.x, this.y, this.w, this.h)

    // Draw stone texture details
    fill(180, 109, 64)
    strokeWeight(1)
    stroke(141, 84, 48)

    for (const stone of stones) {
      // Draw stones relative to current platform position
      ellipse(this.x + stone.x, this.y + stone.y, stone.w, stone.h)
    }

    // Draw procedural grass on top
    fill(119, 225, 49)
    strokeWeight(4)
    stroke(94, 188, 62)

    beginShape()
    vertex(this.x, this.y)

    // Create wavy grass pattern using multiple sine waves
    for (let x = this.x; x <= this.x + this.w; x += 8) {
      const t = (x - this.x) / this.w
      const wave1 = sin(t * TWO_PI * 2.5) * 6
      const wave2 = cos(t * TWO_PI * 6) * 3
      const wave3 = sin(t * TWO_PI * 10) * 1.5
      const wave4 = cos(t * TWO_PI * 4.5) * 4

      const grassY = this.y + 30 - (wave1 + wave2 + wave3 + wave4)
      vertex(x, grassY)
    }

    vertex(this.x + this.w, this.y)
    endShape(CLOSE)

    pop()
  }

  /**
   * Checks if the game character is in contact with this platform
   * @param {number} gameCharPosX - Game character's x position
   * @param {number} gameCharPosY - Game character's y position
   * @returns {boolean} True if character is standing on platform
   */
  platform.isContact = function (gameCharPosX, gameCharPosY) {
    if (
      gameCharPosX + 5 > this.x &&
      gameCharPosX - 5 < this.x + this.w &&
      gameCharPosY > this.y &&
      gameCharPosY < this.y + this.h - 25
    ) {
      return true
    }
    return false
  }

  return platform
}
