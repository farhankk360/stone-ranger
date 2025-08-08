/**
 * Factory function to create platform objects with collision detection
 * @param {number} w - Platform width
 * @param {number} h - Platform height
 * @param {number} x - Platform x position
 * @param {number} y - Platform y position
 * @returns {Object} Platform object with drawPlatform and isContact methods
 */
function Platform(w, h, x, y) {
  const platform = {
    w: w,
    h: h,
    x: x,
    y: y,
  }

  // Generate random stones for texture (done once at creation)
  const stones = []
  for (let i = 0; i < 15; i++) {
    stones.push({
      x: Math.random() * (platform.w - 34) + platform.x + 10,
      y: Math.random() * (platform.h - 34) + platform.y + 10,
      w: Math.random() * 12 + 12,
      h: Math.random() * 12 + 12,
    })
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
      ellipse(stone.x, stone.y, stone.w, stone.h)
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

      const grassY = this.y + 40 - (wave1 + wave2 + wave3 + wave4)
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
