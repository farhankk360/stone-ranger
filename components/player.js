/**
 * Creates a new player character with movement and rendering capabilities
 * @param {number} x - Initial x position
 * @param {number} y - Initial y position
 * @param {number} floorY - Y position of the ground/floor
 * @returns {Object} Player object with update and draw methods
 */
function Player(x, y, floorY) {
  // Player state properties
  this.x = x
  this.y = y
  this.floorY = floorY
  this.startX = x
  this.startY = y

  // Movement states
  this.isLeft = false
  this.isRight = false
  this.isFalling = false
  this.isPlummeting = false

  // Movement properties
  this.speed = 5
  this.jumpPower = 125

  // Animation properties
  this.animationFrame = 0
  this.bodyColor = [255, 152, 0] // Default body color

  /**
   * Updates player position based on input and physics
   * @param {number} floorWidth - Width of the game world
   */
  this.update = function (floorWidth) {
    // Update animation frame
    this.animationFrame += 0.15

    // Handle horizontal movement
    if (this.isLeft && this.x > -width) {
      this.x -= this.speed
    }

    if (this.isRight && this.x < floorWidth) {
      this.x += this.speed
    }

    // Handle falling physics
    if (this.isFalling) {
      this.y += 5

      // Check if fallen off the world
      if (this.y - 5 > this.floorY) {
        this.isPlummeting = true
        this.isLeft = false
        this.isRight = false
      }
    }
  }

  /**
   * Draws the player character based on current state
   */
  this.draw = function () {
    if (this.isLeft && this.isFalling) {
      this.drawLeftFalling()
    } else if (this.isRight && this.isFalling) {
      this.drawRightFalling()
    } else if (this.isLeft) {
      this.drawLeftWalking()
    } else if (this.isRight) {
      this.drawRightWalking()
    } else if (this.isFalling || this.isPlummeting) {
      this.drawFalling()
    } else {
      this.drawIdle()
    }
  }

  /**
   * Draws player in idle standing position
   */
  this.drawIdle = function () {
    // Body
    fill(this.bodyColor)
    ellipse(this.x, this.y - 25, 20, 35)

    // Head
    fill(255, 200, 150)
    ellipse(this.x, this.y - 45, 25, 25)

    // Eyes
    fill(0)
    ellipse(this.x - 5, this.y - 45, 4, 4)
    ellipse(this.x + 5, this.y - 45, 4, 4)

    // Arms
    stroke(this.bodyColor)
    strokeWeight(4)
    line(this.x - 10, this.y - 30, this.x - 15, this.y - 20)
    line(this.x + 10, this.y - 30, this.x + 15, this.y - 20)

    // Legs
    stroke(100, 100, 255)
    line(this.x - 5, this.y - 10, this.x - 5, this.y)
    line(this.x + 5, this.y - 10, this.x + 5, this.y)
    noStroke()
  }

  /**
   * Draws player walking left
   */
  this.drawLeftWalking = function () {
    // Body
    fill(this.bodyColor)
    ellipse(this.x - 2, this.y - 25, 18, 35)

    // Head
    fill(255, 200, 150)
    ellipse(this.x - 5, this.y - 45, 25, 25)

    // Eye (looking left)
    fill(0)
    ellipse(this.x - 10, this.y - 45, 4, 4)

    // Arms
    stroke(this.bodyColor)
    strokeWeight(4)
    line(this.x - 2, this.y - 30, this.x - 12, this.y - 20)

    // Legs (walking animation with foot tapping effect)
    stroke(100, 100, 255)
    const legOffset = Math.sin(this.animationFrame * 5) * 3
    line(this.x - 2, this.y - 10, this.x - 10 + legOffset, this.y)
    line(this.x + 2, this.y - 10, this.x + 5 - legOffset, this.y)
    noStroke()
  }

  /**
   * Draws player walking right
   */
  this.drawRightWalking = function () {
    // Body
    fill(this.bodyColor)
    ellipse(this.x + 2, this.y - 25, 18, 35)

    // Head
    fill(255, 200, 150)
    ellipse(this.x + 5, this.y - 45, 25, 25)

    // Eye (looking right)
    fill(0)
    ellipse(this.x + 10, this.y - 45, 4, 4)

    // Arms
    stroke(this.bodyColor)
    strokeWeight(4)
    line(this.x + 2, this.y - 30, this.x + 12, this.y - 20)

    // Legs (walking animation with foot tapping effect)
    stroke(100, 100, 255)
    const legOffset = Math.sin(this.animationFrame * 5) * 3
    line(this.x - 2, this.y - 10, this.x - 5 + legOffset, this.y)
    line(this.x + 2, this.y - 10, this.x + 10 - legOffset, this.y)
    noStroke()
  }

  /**
   * Draws player falling straight down
   */
  this.drawFalling = function () {
    // Body
    fill(this.bodyColor)
    ellipse(this.x, this.y - 30, 20, 30)

    // Head
    fill(255, 200, 150)
    ellipse(this.x, this.y - 50, 25, 25)

    // Eyes (worried expression)
    fill(0)
    ellipse(this.x - 5, this.y - 50, 4, 4)
    ellipse(this.x + 5, this.y - 50, 4, 4)

    // Arms (spread out for balance)
    stroke(this.bodyColor)
    strokeWeight(4)
    line(this.x - 10, this.y - 35, this.x - 15, this.y - 45)
    line(this.x + 10, this.y - 35, this.x + 15, this.y - 45)

    // Legs (spread out)
    stroke(100, 100, 255)
    line(this.x - 5, this.y - 15, this.x - 10, this.y - 5)
    line(this.x + 5, this.y - 15, this.x + 10, this.y - 5)
    noStroke()
  }

  /**
   * Draws player falling while moving left
   */
  this.drawLeftFalling = function () {
    // Body
    fill(this.bodyColor)
    ellipse(this.x - 2, this.y - 30, 18, 30)

    // Head
    fill(255, 200, 150)
    ellipse(this.x - 5, this.y - 50, 25, 25)

    // Eye
    fill(0)
    ellipse(this.x - 10, this.y - 50, 4, 4)

    // Arms (flailing)
    stroke(this.bodyColor)
    strokeWeight(4)
    line(this.x - 2, this.y - 35, this.x - 15, this.y - 40)

    // Legs (flailing)
    stroke(100, 100, 255)
    line(this.x - 2, this.y - 15, this.x - 12, this.y - 10)
    line(this.x + 2, this.y - 15, this.x + 8, this.y - 5)
    noStroke()
  }

  /**
   * Draws player falling while moving right
   */
  this.drawRightFalling = function () {
    // Body
    fill(this.bodyColor)
    ellipse(this.x + 2, this.y - 30, 18, 30)

    // Head
    fill(255, 200, 150)
    ellipse(this.x + 5, this.y - 50, 25, 25)

    // Eye
    fill(0)
    ellipse(this.x + 10, this.y - 50, 4, 4)

    // Arms (flailing)
    stroke(this.bodyColor)
    strokeWeight(4)
    line(this.x + 2, this.y - 35, this.x + 15, this.y - 40)

    // Legs (flailing)
    stroke(100, 100, 255)
    line(this.x - 2, this.y - 15, this.x - 8, this.y - 5)
    line(this.x + 2, this.y - 15, this.x + 12, this.y - 10)
    noStroke()
  }

  /**
   * Makes the player jump if not already falling
   */
  this.jump = function () {
    if (!this.isFalling) {
      this.y -= this.jumpPower
    }
  }

  /**
   * Sets player movement direction
   * @param {string} direction - 'left', 'right', or 'stop'
   */
  this.move = function (direction) {
    switch (direction) {
      case "left":
        this.isLeft = true
        this.isRight = false
        break
      case "right":
        this.isRight = true
        this.isLeft = false
        break
      case "stop":
        this.isLeft = false
        this.isRight = false
        break
    }
  }

  /**
   * Stops all player movement
   */
  this.stopMovement = function () {
    this.isLeft = false
    this.isRight = false
  }

  /**
   * Resets player to starting position and state
   */
  this.reset = function () {
    this.x = this.startX
    this.y = this.startY
    this.isLeft = false
    this.isRight = false
    this.isFalling = false
    this.isPlummeting = false
  }

  /**
   * Checks if player has fallen off the world
   * @param {number} worldHeight - Height of the game world
   * @returns {boolean} True if player has fallen off the world
   */
  this.hasFallenOffWorld = function (worldHeight) {
    return this.y > worldHeight
  }

  /**
   * Gets the player's current position
   * @returns {Object} Object with x and y properties
   */
  this.getPosition = function () {
    return { x: this.x, y: this.y }
  }

  /**
   * Sets the player's falling state
   * @param {boolean} falling - Whether the player should be falling
   */
  this.setFalling = function (falling) {
    this.isFalling = falling
  }
}
