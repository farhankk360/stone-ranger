/**
 * Creates a new projectile (stone) with physics and collision detection
 * @param {number} x - Starting x position
 * @param {number} y - Starting y position
 * @param {number} direction - Direction to throw (1 for right, -1 for left)
 * @param {number} power - Throwing power (affects speed and arc)
 * @returns {Object} Projectile object with update, draw, and collision methods
 */
function Projectile(x, y, direction, power = 1) {
  this.x = x
  this.y = y
  this.startX = x
  this.startY = y

  this.velocityX = direction * (8 + power * 2) // Horizontal speed
  this.velocityY = -6 - power // Initial upward velocity (negative is up)
  this.gravity = 0.3
  this.bounce = 0.2 // Bounce factor when hitting ground
  this.friction = 0.98 // Air resistance

  this.isActive = true
  this.hasHitGround = false
  this.bounces = 0
  this.maxBounces = 2
  this.size = 12
  this.rotation = 0
  this.rotationSpeed = direction * 0.3

  // Trail effect
  this.trail = []
  this.maxTrailLength = 8

  if (typeof stoneThrowSound !== "undefined" && stoneThrowSound) {
    stoneThrowSound.play()
  }

  this.update = function () {
    if (!this.isActive) return

    // Store previous position for trail effect
    this.trail.push({ x: this.x, y: this.y })
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift()
    }

    this.velocityY += this.gravity // Gravity affects vertical velocity
    this.velocityX *= this.friction // Air resistance

    this.x += this.velocityX
    this.y += this.velocityY

    this.rotation += this.rotationSpeed

    // Reset ground status - will be set to true if we hit something
    const wasOnGround = this.hasHitGround
    this.hasHitGround = false

    // Check platform collisions
    this.checkPlatformCollisions()

    // Keep ground status for slowly rolling stones
    if (wasOnGround && !this.hasHitGround && abs(this.velocityY) < 0.5) {
      this.hasHitGround = true
    }

    // Check if projectile has traveled too far or fallen into void
    const distanceTraveled = abs(this.x - this.startX)

    if (distanceTraveled > width * 3 || this.y > floorPosY + 200) {
      this.isActive = false
    }
  }

  /**
   * Checks collision with platforms and handles bouncing
   */
  this.checkPlatformCollisions = function () {
    for (const platform of platforms) {
      const bounds = {
        x: platform.x,
        y: platform.y,
        width: platform.w,
        height: platform.h,
      }

      // Check if projectile is overlapping with platform
      if (
        this.x + this.size / 2 > bounds.x &&
        this.x - this.size / 2 < bounds.x + bounds.width &&
        this.y + this.size / 2 > bounds.y &&
        this.y - this.size / 2 < bounds.y + bounds.height
      ) {
        // Calculate overlaps
        const overlapX = Math.min(
          this.x + this.size / 2 - bounds.x,
          bounds.x + bounds.width - (this.x - this.size / 2)
        )
        const overlapY = Math.min(
          this.y + this.size / 2 - bounds.y,
          bounds.y + bounds.height - (this.y - this.size / 2)
        )

        if (overlapY < overlapX) {
          // Vertical collision
          if (this.velocityY > 0) {
            // Landing on top of platform
            this.y = bounds.y - this.size / 2
            this.velocityY *= -this.bounce
            this.velocityX *= 0.8
            this.rotationSpeed *= 0.7
            this.bounces++
            this.hasHitGround = true

            if (this.bounces >= this.maxBounces || abs(this.velocityY) < 1) {
              this.velocityY = 0
              this.velocityX *= 0.9
            }
          } else if (this.velocityY < 0) {
            // Hit platform from below
            this.y = bounds.y + bounds.height + this.size / 2
            this.velocityY *= -this.bounce * 0.5
          }
        } else {
          // Horizontal collision
          this.velocityX *= -this.bounce * 0.5
          if (this.x < bounds.x + bounds.width / 2) {
            this.x = bounds.x - this.size / 2
          } else {
            this.x = bounds.x + bounds.width + this.size / 2
          }
          this.rotationSpeed *= 0.7
        }

        break
      }
    }
  }

  /**
   * Draws the projectile with rotation and trail effect
   */
  this.draw = function () {
    if (!this.isActive) return

    const velocity = this.getVelocity()
    const speed = Math.sqrt(
      velocity.velocityX * velocity.velocityX +
        velocity.velocityY * velocity.velocityY
    )
    const canBeCollected = speed < 2 || this.hasHitGround
    const isInFlight = speed > 2 && !this.hasHitGround

    // Draw collection hint if stone can be collected
    if (canBeCollected && player) {
      const playerPos = player.getPosition()
      const distance = dist(playerPos.x, playerPos.y, this.x, this.y)

      if (distance < 80) {
        const pulse = 1 + Math.sin(frameCount * 0.2) * 0.3
        stroke(255, 255, 0, 150)
        strokeWeight(2)
        noFill()
        ellipse(this.x, this.y, 30 * pulse, 30 * pulse)

        if (distance < 50) {
          fill(255, 255, 0)
          textAlign(CENTER, CENTER)
          textSize(12)
          text("COLLECT", this.x, this.y - 25)
        }
      }
    }

    if (isInFlight) {
      this.drawTrail()
      stroke(255, 0, 0, 100)
      strokeWeight(1)
      noFill()
      ellipse(this.x, this.y, 25, 25)
    }

    push()
    translate(this.x, this.y)
    rotate(this.rotation)
    this.drawStone()
    pop()
  }

  /**
   * Draws trailing particles behind the projectile
   */
  this.drawTrail = function () {
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = map(i, 0, this.trail.length - 1, 0, 100)
      const size = map(i, 0, this.trail.length - 1, 2, this.size * 0.5)

      fill(150, 150, 150, alpha)
      noStroke()
      ellipse(this.trail[i].x, this.trail[i].y, size, size)
    }
  }

  this.drawStone = function () {
    const velocity = this.getVelocity()
    const speed = Math.sqrt(
      velocity.velocityX * velocity.velocityX +
        velocity.velocityY * velocity.velocityY
    )
    const isMoving = speed > 1

    const baseColor = isMoving ? 120 : 100
    const strokeColor = isMoving ? 80 : 60

    fill(baseColor, baseColor, baseColor)
    stroke(strokeColor, strokeColor, strokeColor)
    strokeWeight(1)
    ellipse(0, 0, this.size, this.size)

    // Stone texture
    noStroke()
    fill(baseColor + 20, baseColor + 20, baseColor + 20)
    ellipse(-1, -1, this.size * 0.6, this.size * 0.6)

    fill(baseColor - 20, baseColor - 20, baseColor - 20)
    ellipse(1, 1, this.size * 0.3, this.size * 0.3)

    fill(baseColor + 40, baseColor + 40, baseColor + 40)
    ellipse(
      -this.size * 0.2,
      -this.size * 0.2,
      this.size * 0.2,
      this.size * 0.2
    )

    if (this.hasHitGround && speed < 1) {
      fill(0, 0, 0, 50)
      ellipse(2, this.size * 0.4, this.size * 0.8, this.size * 0.3)
    }
  }

  /**
   * Checks collision with a circular target (like enemies)
   * @param {number} targetX - Target x position
   * @param {number} targetY - Target y position
   * @param {number} targetRadius - Target collision radius
   * @returns {boolean} True if projectile hits target
   */
  this.checkCollision = function (targetX, targetY, targetRadius) {
    if (!this.isActive) return false

    const distance = dist(this.x, this.y, targetX, targetY)
    return distance < this.size / 2 + targetRadius
  }

  this.destroy = function () {
    this.isActive = false
  }

  /**
   * Gets the projectile's current position
   * @returns {Object} Object with x and y properties
   */
  this.getPosition = function () {
    return { x: this.x, y: this.y }
  }

  /**
   * Gets the projectile's velocity
   * @returns {Object} Object with velocityX and velocityY properties
   */
  this.getVelocity = function () {
    return { velocityX: this.velocityX, velocityY: this.velocityY }
  }

  /**
   * Sets the projectile's velocity
   * @param {number} vx - New horizontal velocity
   * @param {number} vy - New vertical velocity
   */
  this.setVelocity = function (vx, vy) {
    this.velocityX = vx
    this.velocityY = vy
  }

  /**
   * Sets the projectile's position
   * @param {number} newX - New x position
   * @param {number} newY - New y position
   */
  this.setPosition = function (newX, newY) {
    this.x = newX
    this.y = newY
  }

  /**
   * Checks if the projectile is still active
   * @returns {boolean} True if projectile is still in play
   */
  this.isAlive = function () {
    return this.isActive
  }
}
