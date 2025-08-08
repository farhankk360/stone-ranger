/**
 * Game Manager handles game state, scoring, lives, and level progression
 * @returns {Object} GameManager object with state management methods
 */
function GameManager() {
  // Game state properties
  this.gameScore = 0
  this.lives = 3
  this.gameState = "playing" // 'playing', 'gameOver', 'levelComplete', 'paused'
  this.level = 1
  this.maxLives = 5
  this.stones = 5 // Stone inventory
  this.maxStones = 5

  // Statistics tracking
  this.enemiesDefeated = 0
  this.stonesThrown = 0
  this.stonesCollected = 0
  this.collectablesFound = 0
  this.totalCollectables = 0

  // UI properties
  this.messageTimer = 0
  this.currentMessage = ""

  /**
   * Initializes the game manager with starting values
   * @param {number} totalCollectablesCount - Total collectables in the level
   */
  this.init = function (totalCollectablesCount) {
    this.gameScore = 0
    this.lives = 3
    this.gameState = "playing"
    this.level = 1
    this.stones = 5
    this.enemiesDefeated = 0
    this.stonesThrown = 0
    this.stonesCollected = 0
    this.collectablesFound = 0
    this.totalCollectables = totalCollectablesCount
    this.messageTimer = 0
    this.currentMessage = ""
  }

  /**
   * Updates game manager state (call every frame)
   */
  this.update = function () {
    // Update message timer
    if (this.messageTimer > 0) {
      this.messageTimer--
    }

    // Check game over conditions
    if (this.lives <= 0 && this.gameState === "playing") {
      this.gameState = "gameOver"
    }
  }

  /**
   * Awards points and updates score
   * @param {number} points - Points to add
   * @param {string} reason - Reason for points (for display)
   */
  this.addScore = function (points, reason = "") {
    this.gameScore += points
    if (reason) {
      this.showMessage(`+${points} ${reason}`, 60)
    }
  }

  /**
   * Removes a life and handles game over
   * @returns {boolean} True if game is over
   */
  this.loseLife = function () {
    this.lives--
    this.showMessage(`Life Lost! Lives: ${this.lives}`, 120)

    if (this.lives <= 0) {
      this.gameState = "gameOver"
      return true
    }
    return false
  }

  /**
   * Awards an extra life (for high scores or special collectables)
   */
  this.gainLife = function () {
    if (this.lives < this.maxLives) {
      this.lives++
      this.showMessage("Extra Life!", 120)
    }
  }

  /**
   * Records that a collectable was found
   * @param {number} points - Points awarded for the collectable
   */
  this.collectableFound = function (points = 100) {
    this.collectablesFound++
    this.addScore(points, "Coin!")

    // Award extra life every 5 collectables
    if (this.collectablesFound % 5 === 0) {
      this.gainLife()
    }
  }

  /**
   * Records that an enemy was defeated
   * @param {string} enemyType - Type of enemy defeated
   */
  this.enemyDefeated = function (enemyType = "enemy") {
    this.enemiesDefeated++

    // Different points for different enemy types
    const points = {
      walker: 200,
      jumper: 300,
      guard: 500,
    }

    const awarded = points[enemyType] || 200
    this.addScore(awarded, `${enemyType} defeated!`)
  }

  /**
   * Records that a stone was thrown
   * @returns {boolean} True if stone was thrown successfully
   */
  this.stoneThrown = function () {
    if (this.stones > 0) {
      this.stones--
      this.stonesThrown++
      return true
    }
    this.showMessage("No stones left!", 60)
    return false
  }

  /**
   * Collects a stone (adds to inventory)
   */
  this.stoneCollected = function () {
    if (this.stones < this.maxStones) {
      this.stones++
      this.stonesCollected++
      this.showMessage("Stone collected!", 60)
      return true
    }
    return false
  }

  /**
   * Checks if player can throw a stone
   * @returns {boolean} True if player has stones
   */
  this.canThrowStone = function () {
    return this.stones > 0
  }

  /**
   * Completes the current level
   */
  this.completeLevel = function () {
    this.gameState = "levelComplete"

    // Bonus points for completion
    const timeBonus = Math.max(0, 1000 - frameCount * 2) // Faster completion = more points
    const lifeBonus = this.lives * 500

    this.addScore(timeBonus + lifeBonus, "Level Complete!")
    this.showMessage(`Level ${this.level} Complete!`, 240)
  }

  /**
   * Restarts the current level
   */
  this.restartLevel = function () {
    this.gameState = "playing"
    this.collectablesFound = 0
    this.enemiesDefeated = 0
    this.stonesThrown = 0
    this.stonesCollected = 0
    this.stones = this.maxStones // Reset stone inventory to full
    this.showMessage("Level Restarted", 120)
  }

  /**
   * Resets the entire game
   */
  this.resetGame = function () {
    this.init(this.totalCollectables)
    this.showMessage("Game Reset", 120)
  }

  /**
   * Shows a temporary message
   * @param {string} message - Message to display
   * @param {number} duration - Duration in frames (60 = 1 second)
   */
  this.showMessage = function (message, duration) {
    this.currentMessage = message
    this.messageTimer = duration
  }

  /**
   * Draws the game UI (score, lives, messages)
   */
  this.drawUI = function () {
    // Score display
    fill(0)
    textSize(20)
    textAlign(LEFT)
    text(`Score: ${this.gameScore}`, 20, 30)

    // Level display
    text(`Level: ${this.level}`, 20, 57)

    // Stone inventory display
    fill(0)
    textSize(20)
    text(`Stones: ${this.stones}/${this.maxStones}`, 20, 85)

    // Lives display with heart shapes
    fill(0)
    textSize(20)
    text("Lives: ", 20, 115)

    for (let i = 0; i < this.lives; i++) {
      const size = 16
      const x = 90 + i * 30
      const y = 110
      fill(255, 0, 0)
      beginShape()
      vertex(x, y)
      bezierVertex(
        x - size / 2,
        y - size / 2,
        x - size,
        y + size / 3,
        x,
        y + size
      )
      bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y)
      endShape(CLOSE)
    }

    // Temporary messages
    if (this.messageTimer > 0) {
      this.drawMessage()
    }

    // Game state overlays
    if (this.gameState === "gameOver") {
      this.drawGameOver()
    } else if (this.gameState === "levelComplete") {
      this.drawLevelComplete()
    }
  }

  /**
   * Draws temporary game messages
   */
  this.drawMessage = function () {
    const alpha =
      this.messageTimer > 30 ? 255 : map(this.messageTimer, 0, 30, 0, 255)

    fill(255, 255, 0, alpha)
    stroke(0, alpha)
    strokeWeight(2)
    textSize(24)
    textAlign(CENTER, CENTER)
    text(this.currentMessage, width / 2, height / 4)
    noStroke()
  }

  /**
   * Draws game over screen
   */
  this.drawGameOver = function () {
    // Semi-transparent overlay
    fill(0, 0, 0, 150)
    rect(0, 0, width, height)

    // Game over text
    fill(255, 0, 0)
    textSize(50)
    textAlign(CENTER, CENTER)
    text("Game Over", width / 2, height / 2 - 60)

    // Final score
    fill(255)
    textSize(30)
    text(`Final Score: ${this.gameScore}`, width / 2, height / 2)

    // Statistics
    textSize(20)
    text(
      `Enemies Defeated: ${this.enemiesDefeated}`,
      width / 2,
      height / 2 + 40
    )
    text(
      `Coins Collected: ${this.collectablesFound}`,
      width / 2,
      height / 2 + 70
    )

    // Restart instruction
    fill(200)
    textSize(16)
    text("Press R to Restart", width / 2, height / 2 + 120)
  }

  /**
   * Draws level complete screen
   */
  this.drawLevelComplete = function () {
    // Semi-transparent overlay
    fill(0, 255, 0, 100)
    rect(0, 0, width, height)

    // Level complete text
    fill(0, 255, 0)
    textSize(50)
    textAlign(CENTER, CENTER)
    text("Level Complete!", width / 2, height / 2 - 60)

    // Score
    fill(255)
    textSize(30)
    text(`Score: ${this.gameScore}`, width / 2, height / 2)

    // Instructions
    fill(200)
    textSize(20)
    text("Head to the flagpole to finish!", width / 2, height / 2 + 40)
  }

  /**
   * Gets current game state
   * @returns {string} Current game state
   */
  this.getGameState = function () {
    return this.gameState
  }

  /**
   * Sets game state
   * @param {string} state - New game state
   */
  this.setGameState = function (state) {
    this.gameState = state
  }

  /**
   * Checks if game is playable
   * @returns {boolean} True if player can control character
   */
  this.isPlayable = function () {
    return this.gameState === "playing"
  }

  /**
   * Gets performance statistics
   * @returns {Object} Object with various game statistics
   */
  this.getStats = function () {
    return {
      score: this.gameScore,
      lives: this.lives,
      level: this.level,
      enemiesDefeated: this.enemiesDefeated,
      stonesThrown: this.stonesThrown,
      collectablesFound: this.collectablesFound,
      totalCollectables: this.totalCollectables,
      accuracy:
        this.stonesThrown > 0
          ? ((this.enemiesDefeated / this.stonesThrown) * 100).toFixed(1)
          : 0,
    }
  }
}
