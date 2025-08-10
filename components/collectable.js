/**
 * Individual collectable object
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Size of the collectable
 * @param {string} type - Type of collectable ('coin', 'gem', 'powerup')
 */
function Collectable(x, y, size = 40, type = "coin") {
  this.x_pos = x
  this.y_pos = y
  this.size = size
  this.type = type
  this.isFound = false
  this.animationFrame = 0
  this.bobOffset = Math.random() * TWO_PI // Random start for bobbing animation
  this.sparkles = []

  this.update = function () {
    if (this.isFound) return

    this.animationFrame += 0.1

    // Create sparkle effects occasionally
    if (Math.random() < 0.1) {
      this.sparkles.push({
        x: this.x_pos + (Math.random() - 0.5) * this.size,
        y: this.y_pos + (Math.random() - 0.5) * this.size,
        life: 30,
        maxLife: 30,
      })
    }

    // Update sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const sparkle = this.sparkles[i]
      sparkle.life--
      sparkle.y -= 1

      if (sparkle.life <= 0) {
        this.sparkles.splice(i, 1)
      }
    }
  }

  this.draw = function () {
    if (this.isFound) return

    push()

    // Bobbing animation
    const bobAmount = sin(this.animationFrame + this.bobOffset) * 3
    const currentY = this.y_pos + bobAmount

    translate(this.x_pos, currentY)

    // Draw sparkles first (behind coin)
    this.drawSparkles()

    // Draw based on type
    switch (this.type) {
      case "coin":
        this.drawCoin(this.size)
        break
      case "gem":
        this.drawGem(this.size)
        break
      case "powerup":
        this.drawPowerup(this.size)
        break
    }

    pop()
  }

  this.drawSparkles = function () {
    for (const sparkle of this.sparkles) {
      const alpha = map(sparkle.life, 0, sparkle.maxLife, 0, 255)
      const size = map(sparkle.life, 0, sparkle.maxLife, 1, 4)

      fill(255, 255, 255, alpha)
      noStroke()

      this.drawStar(sparkle.x - this.x_pos, sparkle.y - this.y_pos, size)
    }
  }

  /**
   * Draws a small star shape
   * @param {number} x - X position relative to origin
   * @param {number} y - Y position relative to origin
   * @param {number} size - Size of the star
   */
  this.drawStar = function (x, y, size) {
    push()
    translate(x, y)
    beginShape()
    for (let i = 0; i < 10; i++) {
      const angle = map(i, 0, 10, 0, TWO_PI)
      const radius = i % 2 === 0 ? size : size * 0.5
      const px = cos(angle) * radius
      const py = sin(angle) * radius
      vertex(px, py)
    }
    endShape(CLOSE)
    pop()
  }

  /**
   * Draws a coin collectable
   * @param {number} size - Size of the coin
   */
  this.drawCoin = function (size) {
    // Outer ring
    stroke(0)
    strokeWeight(1)
    fill(255, 215, 0) // Gold
    ellipse(0, 0, size, size)

    // Inner ring
    fill(255, 180, 0)
    ellipse(0, 0, size * 0.75, size * 0.75)

    // Center symbol
    noStroke()
    fill(255, 240, 0)
    textSize(size * 0.5)
    textAlign(CENTER, CENTER)
    text("$", 0, 0)

    // Highlight effect
    fill(255, 255, 255, 100)
    ellipse(-size * 0.2, -size * 0.2, size * 0.3, size * 0.3)
  }

  /**
   * Draws a gem collectable (worth more points)
   * @param {number} size - Size of the gem
   */
  this.drawGem = function (size) {
    // Gem body
    fill(138, 43, 226) // Blue violet
    stroke(75, 0, 130)
    strokeWeight(2)

    beginShape()
    vertex(0, -size * 0.4)
    vertex(size * 0.3, -size * 0.2)
    vertex(size * 0.4, size * 0.2)
    vertex(0, size * 0.5)
    vertex(-size * 0.4, size * 0.2)
    vertex(-size * 0.3, -size * 0.2)
    endShape(CLOSE)

    // Gem highlights
    fill(200, 162, 255, 150)
    noStroke()
    triangle(0, -size * 0.4, size * 0.2, -size * 0.1, 0, size * 0.1)
    triangle(0, -size * 0.4, -size * 0.2, -size * 0.1, 0, size * 0.1)
  }

  /**
   * Draws a powerup collectable (special abilities)
   * @param {number} size - Size of the powerup
   */
  this.drawPowerup = function (size) {
    fill(255, 20, 147) // Deep pink
    stroke(139, 0, 69)
    strokeWeight(2)

    beginShape()
    for (let i = 0; i < 8; i++) {
      const angle = map(i, 0, 8, 0, TWO_PI)
      const radius = i % 2 === 0 ? size * 0.4 : size * 0.2
      const x = cos(angle) * radius
      const y = sin(angle) * radius
      vertex(x, y)
    }
    endShape(CLOSE)

    // Center glow
    fill(255, 192, 203, 150)
    noStroke()
    ellipse(0, 0, size * 0.3, size * 0.3)

    // Power symbol
    fill(255)
    textSize(size * 0.3)
    textAlign(CENTER, CENTER)
    text("!", 0, 0)
  }

  /**
   * Checks if the player has collected this collectable
   * @param {Object} player - The player object
   * @param {number} collectionDistance - Distance for collection (default 50)
   * @returns {boolean} True if collectable was just collected
   */
  this.checkCollection = function (player, collectionDistance = 50) {
    if (this.isFound) return false

    const playerPos = player.getPosition()
    const distance = dist(playerPos.x, playerPos.y, this.x_pos, this.y_pos)

    if (distance < collectionDistance) {
      this.isFound = true

      // Play coin collection sound if available
      if (typeof coinSound !== "undefined" && coinSound) {
        coinSound.play()
      }

      return true
    }

    return false
  }

  /**
   * Gets the point value for this collectable type
   * @returns {number} Point value
   */
  this.getPointValue = function () {
    const values = {
      coin: 100,
      gem: 500,
      powerup: 1000,
    }
    return values[this.type] || 100
  }
}

/**
 * Manages collections of collectables
 * @param {Array} positions - Array of {x, y} position objects (optional)
 */
function Collectables(positions = []) {
  this.collectables = []

  positions.forEach((pos) => {
    this.collectables.push(new Collectable(pos.x, pos.y, 40, pos.type))
  })

  this.updateAll = function () {
    for (const collectable of this.collectables) {
      collectable.update()
    }
  }

  this.drawAll = function () {
    for (const collectable of this.collectables) {
      collectable.draw()
    }
  }

  /**
   * Check collection for all collectables against a player
   * @param {Object} player - The player object
   * @returns {Array} Array of {collectable, points} for collected items
   */
  this.checkAllCollections = function (player) {
    const collected = []
    for (const collectable of this.collectables) {
      if (collectable.checkCollection(player)) {
        collected.push({
          collectable: collectable,
          points: collectable.getPointValue(),
        })
      }
    }
    return collected
  }

  this.getCount = function () {
    return this.collectables.length
  }

  this.getCollectedCount = function () {
    return this.collectables.filter((c) => c.isFound).length
  }

  this.getRemainingCount = function () {
    return this.collectables.filter((c) => !c.isFound).length
  }
}
