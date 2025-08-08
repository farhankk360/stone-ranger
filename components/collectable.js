/**
 * Creates and manages collectable coins in the game
 * Simple object-based approach for managing collectables
 */
const CollectableManager = {
  /**
   * Creates a new collectable object
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} size - Size of the collectable
   * @param {string} type - Type of collectable ('coin', 'gem', 'powerup')
   * @returns {Object} Collectable object
   */
  create: function (x, y, size = 40, type = "coin") {
    return {
      x_pos: x,
      y_pos: y,
      size: size,
      type: type,
      isFound: false,
      animationFrame: 0,
      bobOffset: Math.random() * TWO_PI, // Random start for bobbing animation
      sparkles: [],
    }
  },

  /**
   * Updates collectable animations
   * @param {Object} collectable - The collectable to update
   */
  update: function (collectable) {
    if (collectable.isFound) return

    collectable.animationFrame += 0.1

    // Create sparkle effects occasionally
    if (Math.random() < 0.1) {
      collectable.sparkles.push({
        x: collectable.x_pos + (Math.random() - 0.5) * collectable.size,
        y: collectable.y_pos + (Math.random() - 0.5) * collectable.size,
        life: 30,
        maxLife: 30,
      })
    }

    // Update sparkles
    for (let i = collectable.sparkles.length - 1; i >= 0; i--) {
      const sparkle = collectable.sparkles[i]
      sparkle.life--
      sparkle.y -= 1

      if (sparkle.life <= 0) {
        collectable.sparkles.splice(i, 1)
      }
    }
  },

  /**
   * Draws a collectable if not yet found
   * @param {Object} collectable - The collectable object to draw
   */
  draw: function (collectable) {
    if (collectable.isFound) return

    push()

    // Bobbing animation
    const bobAmount =
      sin(collectable.animationFrame + collectable.bobOffset) * 3
    const currentY = collectable.y_pos + bobAmount

    translate(collectable.x_pos, currentY)

    // Draw sparkles first (behind coin)
    this.drawSparkles(collectable)

    // Draw based on type
    switch (collectable.type) {
      case "coin":
        this.drawCoin(collectable.size)
        break
      case "gem":
        this.drawGem(collectable.size)
        break
      case "powerup":
        this.drawPowerup(collectable.size)
        break
    }

    pop()
  },

  /**
   * Draws sparkle effects around collectable
   * @param {Object} collectable - The collectable object
   */
  drawSparkles: function (collectable) {
    for (const sparkle of collectable.sparkles) {
      const alpha = map(sparkle.life, 0, sparkle.maxLife, 0, 255)
      const size = map(sparkle.life, 0, sparkle.maxLife, 1, 4)

      fill(255, 255, 255, alpha)
      noStroke()

      // Draw sparkle as a small star
      this.drawStar(
        sparkle.x - collectable.x_pos,
        sparkle.y - collectable.y_pos,
        size
      )
    }
  },

  /**
   * Draws a small star shape
   * @param {number} x - X position relative to origin
   * @param {number} y - Y position relative to origin
   * @param {number} size - Size of the star
   */
  drawStar: function (x, y, size) {
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
  },

  /**
   * Draws a coin collectable
   * @param {number} size - Size of the coin
   */
  drawCoin: function (size) {
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
  },

  /**
   * Draws a gem collectable (worth more points)
   * @param {number} size - Size of the gem
   */
  drawGem: function (size) {
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
  },

  /**
   * Draws a powerup collectable (special abilities)
   * @param {number} size - Size of the powerup
   */
  drawPowerup: function (size) {
    // Powerup body (star shape)
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
  },

  /**
   * Checks if the player has collected a collectable
   * @param {Object} collectable - The collectable to check
   * @param {Object} player - The player object
   * @param {number} collectionDistance - Distance for collection (default 50)
   * @returns {boolean} True if collectable was just collected
   */
  checkCollection: function (collectable, player, collectionDistance = 50) {
    if (collectable.isFound) return false

    const playerPos = player.getPosition()
    const distance = dist(
      playerPos.x,
      playerPos.y,
      collectable.x_pos,
      collectable.y_pos
    )

    if (distance < collectionDistance) {
      collectable.isFound = true

      // Create collection effect
      this.createCollectionEffect(collectable)

      return true
    }

    return false
  },

  /**
   * Creates a visual effect when collectable is collected
   * @param {Object} collectable - The collected collectable
   */
  createCollectionEffect: function (collectable) {
    // Create burst of sparkles
    for (let i = 0; i < 10; i++) {
      const angle = (TWO_PI / 10) * i
      const speed = random(2, 6)
      collectable.sparkles.push({
        x: collectable.x_pos + cos(angle) * speed * 5,
        y: collectable.y_pos + sin(angle) * speed * 5,
        life: 60,
        maxLife: 60,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed - 2, // Upward bias
      })
    }
  },

  /**
   * Gets the point value for different collectable types
   * @param {string} type - The type of collectable
   * @returns {number} Point value
   */
  getPointValue: function (type) {
    const values = {
      coin: 100,
      gem: 500,
      powerup: 1000,
    }
    return values[type] || 100
  },

  /**
   * Creates a standard set of collectables for a level
   * @param {Array} positions - Array of {x, y} position objects
   * @param {string} defaultType - Default collectable type
   * @returns {Array} Array of collectable objects
   */
  createSet: function (positions, defaultType = "coin") {
    const collectables = []

    for (const pos of positions) {
      // Occasionally create special collectables
      let type = defaultType
      const rand = Math.random()
      if (rand < 0.05) type = "powerup" // 5% chance for powerup
      else if (rand < 0.15) type = "gem" // 10% chance for gem

      collectables.push(this.create(pos.x, pos.y, 40, type))
    }

    return collectables
  },
}
