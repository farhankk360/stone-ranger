/**
 * Creates a new enemy with patrol behavior and collision detection
 * @param {number} x - Initial x position
 * @param {number} y - Initial y position
 * @param {number} patrolDistance - Distance to patrol left/right from start position
 * @param {string} type - Enemy type ('walker', 'jumper', 'guard')
 * @returns {Object} Enemy object with update, draw, and collision methods
 */
function Enemy(x, y, patrolDistance, type = "walker") {
  // Enemy properties
  this.startX = x
  this.x = x
  this.y = y
  this.patrolDistance = patrolDistance
  this.type = type
  this.isAlive = true
  this.deathTimer = 0 // Timer for fade-out effect
  this.maxDeathTimer = 120 // 2 seconds at 60fps

  // Movement properties
  this.speed = 1
  this.direction = 1 // 1 for right, -1 for left
  this.animationFrame = 0

  // Enemy dimensions for collision
  this.width = 30
  this.height = 40

  // Physics properties (simplified like player)
  this.isOnGround = false

  /**
   * Updates enemy position and AI behavior
   */
  this.update = function () {
    this.animationFrame += 0.1

    // Handle death fade-out
    if (!this.isAlive) {
      this.deathTimer++
      return this.deathTimer < this.maxDeathTimer // Return false when ready to remove
    }

    // Apply gravity and platform physics FIRST
    this.updatePhysics()

    // Then update movement based on current ground state
    switch (this.type) {
      case "walker":
        this.updateWalker()
        break
      case "jumper":
        this.updateWalker() // Jumpers now behave like walkers
        break
      case "guard":
        this.updateGuard()
        break
    }

    return true // Enemy is still active
  }

  /**
   * Updates enemy physics including gravity and platform collision
   */
  this.updatePhysics = function () {
    if (!this.isOnGround) {
      this.y += 5
    }

    this.isOnGround = false
    for (const platform of platforms) {
      if (platform.isContact(this.x, this.y)) {
        this.isOnGround = true
        break
      }
    }

    if (this.y > floorPosY + 200) {
      this.x = this.startX
      this.y = this.startX < 1300 ? floorPosY : floorPosY - 120
    }
  }

  /**
   * Basic walking patrol behavior
   */
  this.updateWalker = function () {
    if (!this.isOnGround) return

    const nextX = this.x + this.speed * this.direction

    let willBeOnPlatform = false
    for (const platform of platforms) {
      if (platform.isContact(nextX, this.y)) {
        willBeOnPlatform = true
        break
      }
    }

    if (
      !willBeOnPlatform ||
      nextX >= this.startX + this.patrolDistance ||
      nextX <= this.startX - this.patrolDistance
    ) {
      this.direction *= -1
    } else {
      this.x = nextX
    }
  }

  /**
   * Stationary guard behavior - doesn't move much
   */
  this.updateGuard = function () {
    const sway = Math.sin(this.animationFrame * 2) * 2
    this.x = this.startX + sway
  }

  /**
   * Draws the enemy based on its type and state
   */
  this.draw = function () {
    if (!this.isAlive) {
      this.drawDead()
      return
    }

    push()
    translate(this.x, this.y)

    switch (this.type) {
      case "walker":
        this.drawWalker()
        break
      case "jumper":
        this.drawJumper()
        break
      case "guard":
        this.drawGuard()
        break
    }

    pop()
  }

  /**
   * Draws a basic walking enemy
   */
  this.drawWalker = function () {
    // Body
    fill(220, 20, 60) // Crimson
    ellipse(0, -20, this.width, this.height * 0.8)

    // Head
    fill(180, 15, 45)
    ellipse(0, -35, 20, 20)

    // Eyes (angry red)
    fill(255, 0, 0)
    ellipse(this.direction > 0 ? 4 : -4, -35, 3, 3)
    ellipse(this.direction > 0 ? -2 : 2, -35, 3, 3)

    // Walking animation - legs
    fill(160, 10, 35)
    const legOffset = Math.sin(this.animationFrame * 5) * 3
    ellipse(-8, -5, 6, 12 + legOffset)
    ellipse(8, -5, 6, 12 - legOffset)

    // Arms
    ellipse(this.direction > 0 ? 12 : -12, -25, 5, 15)
    ellipse(this.direction > 0 ? -8 : 8, -25, 5, 15)
  }

  /**
   * Draws a jumping enemy
   */
  this.drawJumper = function () {
    // Body (more elongated for jumping)
    fill(60, 180, 75) // Green
    ellipse(0, -25, this.width * 0.8, this.height)

    // Head
    fill(45, 140, 60)
    ellipse(0, -40, 18, 18)

    // Eyes
    fill(255, 255, 0) // Yellow eyes
    ellipse(this.direction > 0 ? 3 : -3, -40, 4, 4)
    ellipse(this.direction > 0 ? -3 : 3, -40, 4, 4)

    // Spring-like legs (simplified, no jumping effect)
    fill(40, 120, 50)
    ellipse(-6, -8, 4, 16)
    ellipse(6, -8, 4, 16)

    // Arms
    ellipse(this.direction > 0 ? 10 : -10, -20, 4, 12)
    ellipse(this.direction > 0 ? -6 : 6, -20, 4, 12)
  }

  /**
   * Draws a guard enemy
   */
  this.drawGuard = function () {
    // Body (larger, more imposing)
    fill(128, 64, 0) // Brown
    ellipse(0, -25, this.width * 1.2, this.height)

    // Armor/chest plate
    fill(169, 169, 169) // Dark gray
    ellipse(0, -25, this.width * 0.8, this.height * 0.6)

    // Head
    fill(139, 90, 43)
    ellipse(0, -42, 22, 22)

    // Helmet
    fill(105, 105, 105)
    arc(0, -42, 24, 20, PI, TWO_PI)

    // Eyes (stern)
    fill(0)
    ellipse(-4, -42, 2, 4)
    ellipse(4, -42, 2, 4)

    // Static legs (standing guard)
    fill(100, 50, 0)
    ellipse(-8, -5, 8, 16)
    ellipse(8, -5, 8, 16)

    // Shield or weapon
    fill(192, 192, 192)
    ellipse(this.direction > 0 ? 18 : -18, -30, 6, 20)
  }

  /**
   * Draws dead enemy with fade-out effect
   */
  this.drawDead = function () {
    push()
    translate(this.x, this.y)

    // Calculate fade-out alpha
    const alpha = map(this.deathTimer, 0, this.maxDeathTimer, 255, 0)

    // Draw fading body lying down
    fill(100, alpha)
    ellipse(0, -10, this.width, this.height * 0.5)

    // X eyes
    stroke(255, 0, 0, alpha)
    strokeWeight(2)
    line(-5, -15, -1, -11)
    line(-1, -15, -5, -11)
    line(1, -15, 5, -11)
    line(5, -15, 1, -11)
    noStroke()

    pop()
  }

  /**
   * Checks collision with player
   * @param {Object} player - Player object with getPosition method
   * @returns {boolean} True if colliding with player
   */
  this.checkPlayerCollision = function (player) {
    if (!this.isAlive) return false

    const playerPos = player.getPosition()
    const distance = dist(this.x, this.y, playerPos.x, playerPos.y)

    return distance < this.width / 2 + 15 // Player collision radius ~15
  }

  /**
   * Checks collision with projectiles
   * @param {Object} projectile - Projectile object
   * @returns {boolean} True if hit by projectile
   */
  this.checkProjectileCollision = function (projectile) {
    if (!this.isAlive) return false

    const distance = dist(this.x, this.y - 20, projectile.x, projectile.y)
    return distance < this.width / 2 + 8 // Projectile collision radius
  }

  /**
   * Kills the enemy (called when hit by projectile)
   */
  this.kill = function () {
    this.isAlive = false
  }

  /**
   * Gets the enemy's current position
   * @returns {Object} Object with x and y properties
   */
  this.getPosition = function () {
    return { x: this.x, y: this.y }
  }

  /**
   * Gets the enemy's bounding box for collision detection
   * @returns {Object} Object with x, y, width, height properties
   */
  this.getBounds = function () {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height,
      width: this.width,
      height: this.height,
    }
  }

  /**
   * Resets enemy to initial state
   */
  this.reset = function () {
    this.x = this.startX
    this.y = floorPosY
    this.direction = 1
    this.isAlive = true
    this.animationFrame = 0
  }
}
