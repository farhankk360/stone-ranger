// The Game Project Part 7 - Make it awesome!
// Modular 2D Platformer with Enemies and Projectiles

// ============= GAME VARIABLES =============
let floorWidth
let floorPosY
let gameManager
let player
let enemies = []
let projectiles = []
let collectables = []
let platforms = []
let flagpole
let background

let cameraPosX = 0
let cameraPosY = 0

// Input tracking
let keyStates = {}

// ============= SOUND VARIABLES =============
let bgAtmosphereWind
let bgMusic
let jumpSound
let coinSound
let enemyDieSound
let playerDieSound
let stoneThrowSound
let victorySound

// Sound management
let currentBgMusic = null
let bgMusicInitialized = false

// ============= PRELOAD FUNCTION =============
function preload() {
  // Specify sound formats
  soundFormats("mp3", "wav", "ogg")

  // Load all sound files
  bgAtmosphereWind = loadSound("resources/bg-wind.mp3")
  bgMusic = loadSound("resources/the-real-champion-sound-farhankk360.mp3")
  jumpSound = loadSound("resources/player-jump.wav")
  coinSound = loadSound("resources/coin-collected.wav")
  enemyDieSound = loadSound("resources/enemy-die.wav")
  playerDieSound = loadSound("resources/player-die.wav")
  stoneThrowSound = loadSound("resources/stone-throw.wav")
  victorySound = loadSound("resources/victory.ogg")

  // Set initial volumes
  bgAtmosphereWind.setVolume(0.2)
  bgMusic.setVolume(0.3)
  jumpSound.setVolume(0.3)
  coinSound.setVolume(0.4)
  enemyDieSound.setVolume(0.5)
  playerDieSound.setVolume(0.5)
  stoneThrowSound.setVolume(0.3)
  victorySound.setVolume(0.7)
}

// ============= GAME SETUP =============
function setup() {
  createCanvas(1224, 620)
  floorPosY = (height * 3) / 4
  floorWidth = width * 2 // world width 2448 px
  // Initialize game state manager
  gameManager = new GameStateManager()
  // Initialize background system
  background = new Background()
  background.init(floorPosY, floorWidth, height, width)
  // Create platforms using factory pattern
  platforms = [
    // stairs + elevator platforms
    new Platform(120, 40, -floorWidth - 50, floorPosY - 150, {
      isMoving: true,
      moveDistance: 100,
      speed: 0.5,
      moveDirection: "vertical",
    }),
    new Platform(120, 40, -floorWidth + 120, floorPosY - 120),
    new Platform(150, 50, -floorWidth + 300, floorPosY - 70),
    new Platform(800, height - floorPosY, -floorWidth + 500, floorPosY),
    new Platform(200, 40, -1050, floorPosY - 80, {
      isMoving: true,
      moveDistance: 100,
      speed: 1,
    }),
    new Platform(1100, height - floorPosY, -floorWidth + 1700, floorPosY),
    new Platform(400, height - floorPosY + 100, 450, floorPosY - 25),
    new Platform(200, 40, 900, floorPosY - 70),
    new Platform(300, 40, 1150, floorPosY - 120),
    new Platform(150, 40, 1500, floorPosY - 180),
    new Platform(500, height - floorPosY, 1900, floorPosY),
    // interesting moving platforms
    new Platform(120, 40, 2450, floorPosY - 200, {
      isMoving: true,
      moveDistance: 150,
      speed: 1.5,
      moveDirection: "vertical",
    }),
    new Platform(120, 40, 2600, floorPosY - 400, {
      isMoving: true,
      moveDistance: 250,
      speed: 0.9,
    }),
    new Platform(250, 60, 3200, floorPosY - 250),
    new Platform(800, height - floorPosY, 3700, floorPosY),
    new Platform(1000, height - floorPosY, 4600, floorPosY),
    new Platform(150, 40, 5000, floorPosY - 100),
    new Platform(150, 40, 5200, floorPosY - 150),
    new Platform(150, 40, 5400, floorPosY - 200),
    new Platform(150, 40, 5600, floorPosY - 250),
    new Platform(150, 40, 5800, floorPosY - 300),
    new Platform(1250, height - floorPosY, 6200, floorPosY),
  ]
  initializeEnemies()
  initializeCollectables()
  // Create flagpole
  flagpole = { x_pos: floorWidth + 4600, isReached: false }
  startGame()

  document.getElementById("loading-message").style.display = "none"
}

function initializeEnemies() {
  enemies = [
    new Enemy(-floorWidth + 180, floorPosY - 120, 50, "guard"),
    new Enemy(-floorWidth + 900, floorPosY, 200, "walker"),
    new Enemy(700, floorPosY, 250, "jumper"),
    new Enemy(1250, floorPosY - 120, 200, "walker"),
    new Enemy(1900, floorPosY, 500, "walker"),
    new Enemy(2000, floorPosY, 500, "guard"),
    new Enemy(3300, floorPosY - 550, 250, "walker"),

    new Enemy(3700, floorPosY, 500, "jumper"),
    new Enemy(3800, floorPosY, 500, "guard"),

    new Enemy(5050, floorPosY, 200, "walker"),
    new Enemy(5250, floorPosY, 250, "jumper"),
    new Enemy(5280, floorPosY, 500, "walker"),
    new Enemy(5600, floorPosY, 500, "guard"),
  ]
}

function initializeCollectables() {
  collectables = new Collectables([
    { x: -floorWidth + 20, y: floorPosY - 300, type: "gem" },
    { x: -floorWidth + 900, y: floorPosY - 30 },
    { x: -500, y: floorPosY - 30 },
    { x: 650, y: floorPosY - 50 },
    { x: 1250, y: floorPosY - 150, type: "powerup" },
    { x: 2200, y: floorPosY - 20 },
    { x: 2300, y: floorPosY - 450, type: "gem" },
    { x: 3300, y: floorPosY - 290, type: "powerup" },

    { x: 3800, y: floorPosY - 30 },
    { x: 4300, y: floorPosY - 30 },

    { x: 5050, y: floorPosY - 130 },
    { x: 5250, y: floorPosY - 30 },
    { x: 5280, y: floorPosY - 180, type: "powerup" },
    { x: 5600, y: floorPosY - 30, type: "gem" },
  ])
  gameManager.init(collectables.getCount())
}

function startGame() {
  // Create player using constructor function
  player = new Player(0, floorPosY, floorPosY)

  cameraPosX = 0
  cameraPosY = 0

  gameManager.restartLevel()
}

// ============= SOUND MANAGEMENT =============

function startBackgroundMusic() {
  if (currentBgMusic && currentBgMusic.isPlaying()) {
    currentBgMusic.stop()
    bgMusic.stop()
  }

  // Ensure audio context is started (browser requirement)
  if (getAudioContext().state !== "running") {
    getAudioContext().resume()
  }

  currentBgMusic = bgAtmosphereWind
  if (!bgAtmosphereWind.isPlaying()) {
    bgAtmosphereWind.loop()
    bgMusic.loop()
    bgMusicInitialized = true
  }
}

function toggleBackgroundMusic() {
  if (currentBgMusic && currentBgMusic.isPlaying()) {
    currentBgMusic.pause()
    bgMusic.pause()
  } else {
    currentBgMusic.play()
    bgMusic.play()
  }
}

/**
 * Plays victory music when level is complete
 */
function playVictoryMusic() {
  if (currentBgMusic && currentBgMusic.isPlaying()) {
    currentBgMusic.stop()
  }
}

function resetGameWorld() {
  // Reset all projectiles
  projectiles = []

  // Reset all enemies to initial state
  initializeEnemies()

  // Reset flagpole
  flagpole.isReached = false
}

// ============= MAIN GAME LOOP =============
function draw() {
  // Draw background elements first (before camera transform)

  push()

  // Update and apply camera
  background.drawAll(cameraPosX, floorPosY, floorWidth, height, width)
  updateCamera()
  translate(-cameraPosX, -cameraPosY)

  // Update and draw game entities
  updateGameLogic()
  drawGameEntities()

  pop()

  // Draw UI (always on top)
  gameManager.drawUI()

  // Handle input
  handleContinuousInput()
}

/**
 * Updates camera position with smooth following
 */
function updateCamera() {
  const playerPos = player.getPosition()
  const newCameraPosX = playerPos.x - width / 2
  const newCameraPosY = playerPos.y - height * 0.6

  const minCameraPosY = -height * 0.2
  const maxCameraPosY = 0
  const boundedCameraPosY = constrain(
    newCameraPosY,
    minCameraPosY,
    maxCameraPosY
  )

  cameraPosX = cameraPosX * 0.95 + newCameraPosX * 0.05
  cameraPosY = cameraPosY * 0.92 + boundedCameraPosY * 0.08
}

/**
 * Updates all game logic
 */
function updateGameLogic() {
  if (!gameManager.isPlayable()) return

  // Update game manager
  gameManager.update()

  // Update player physics and platform collision
  updatePlayerPhysics()

  // Update player
  player.update(floorWidth)

  // Update collectables
  collectables.updateAll()

  // Update platforms (for moving platforms)
  for (const platform of platforms) {
    if (platform.update) {
      const movement = platform.update()

      // If platform moved, move entities standing on it
      if (movement && (movement.deltaX !== 0 || movement.deltaY !== 0)) {
        // Move player if standing on this platform
        const playerPos = player.getPosition()
        if (
          platform.isContact(playerPos.x, playerPos.y) &&
          !player.isPlummeting
        ) {
          player.setPosition(
            playerPos.x + movement.deltaX,
            playerPos.y + movement.deltaY
          )
        }

        // Move enemies if standing on this platform
        for (const enemy of enemies) {
          if (enemy.isAlive && platform.isContact(enemy.x, enemy.y)) {
            enemy.x += movement.deltaX
            enemy.y += movement.deltaY
            // Update start position for patrol behavior
            enemy.startX += movement.deltaX
          }
        }

        // Move projectiles if they're on this platform
        for (const projectile of projectiles) {
          if (platform.isContact(projectile.x, projectile.y)) {
            projectile.setPosition(
              projectile.x + movement.deltaX,
              projectile.y + movement.deltaY
            )
          }
        }
      }
    }
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i]
    const stillActive = enemy.update()

    // Remove enemy if fade-out is complete
    if (!stillActive) {
      enemies.splice(i, 1)
      continue
    }

    // Check enemy-player collision (only if enemy is alive)
    if (enemy.isAlive && enemy.checkPlayerCollision(player)) {
      // Play player death sound
      if (typeof playerDieSound !== "undefined" && playerDieSound) {
        playerDieSound.play()
      }
      if (gameManager.loseLife()) {
        projectiles = [] // Clear all projectiles on game over
        return // Game over
      }
      projectiles = [] // Clear all projectiles on level restart
      resetGameWorld() // Reset enemies and world state
      startGame() // Restart level
      return
    }
  }

  // Update projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i]
    projectile.update()

    // Check if projectile can be collected
    const velocity = projectile.getVelocity()
    const speed = Math.sqrt(
      velocity.velocityX * velocity.velocityX +
        velocity.velocityY * velocity.velocityY
    )
    const playerPos = player.getPosition()
    const distanceToPlayer = dist(
      playerPos.x,
      playerPos.y,
      projectile.x,
      projectile.y
    )

    // Allow collection if stone is moving slowly or has hit ground, and player is close
    if ((speed < 2 || projectile.hasHitGround) && distanceToPlayer < 50) {
      if (gameManager.stoneCollected()) {
        projectiles.splice(i, 1)
        continue
      }
    }

    // Check projectile-enemy collisions (only if stone is in flight)
    const projectileVel = projectile.getVelocity()
    const projectileSpeed = Math.sqrt(
      projectileVel.velocityX * projectileVel.velocityX +
        projectileVel.velocityY * projectileVel.velocityY
    )
    const isInFlight = projectileSpeed > 2 && !projectile.hasHitGround

    if (isInFlight) {
      for (const enemy of enemies) {
        if (
          enemy.isAlive &&
          projectile.checkCollision(enemy.x, enemy.y - 20, 20)
        ) {
          enemy.kill()
          gameManager.enemyDefeated(enemy.type)

          // Make stone bounce off enemy instead of destroying it
          const dx = projectile.x - enemy.x
          const dy = projectile.y - (enemy.y - 20)
          const distance = sqrt(dx * dx + dy * dy)

          if (distance > 0) {
            // Normalize direction vector
            const normalX = dx / distance
            const normalY = dy / distance

            // Apply bounce effect
            const bounceForce = 3
            const currentVel = projectile.getVelocity()
            projectile.setVelocity(
              normalX * bounceForce + currentVel.velocityX * 0.3,
              normalY * bounceForce - 2 // Add upward component
            )

            // Move stone away from enemy to prevent stuck collision
            projectile.setPosition(
              enemy.x + normalX * 25,
              enemy.y - 20 + normalY * 25
            )
          }

          break
        }
      }
    }

    // Remove inactive projectiles
    if (!projectile.isAlive()) {
      projectiles.splice(i, 1)
    }
  }

  // Check collections and handle scoring
  const collected = collectables.checkAllCollections(player)
  for (const collection of collected) {
    gameManager.collectableFound(collection.points)
  }

  // Check flagpole
  checkFlagpole()

  // Check if player fell off world
  if (player.hasFallenOffWorld(height)) {
    // Play player death sound
    if (typeof playerDieSound !== "undefined" && playerDieSound) {
      playerDieSound.play()
    }
    if (gameManager.loseLife()) {
      projectiles = [] // Clear all projectiles on game over
      return // Game over
    }
    projectiles = [] // Clear all projectiles on level restart
    resetGameWorld() // Reset enemies and world state
    startGame() // Restart level
  }
}

/**
 * Updates player physics and platform collision detection
 */
function updatePlayerPhysics() {
  player.setFalling(true)

  // Check platform collisions
  for (const platform of platforms) {
    if (
      platform.isContact(player.getPosition().x, player.getPosition().y) &&
      !player.isPlummeting
    ) {
      player.setFalling(false)
      break
    }
  }
}

/**
 * Draws all game entities
 */
function drawGameEntities() {
  // Draw platforms
  for (const platform of platforms) {
    platform.drawPlatform()
  }

  // Draw collectables
  collectables.drawAll()

  // Draw enemies
  for (const enemy of enemies) {
    enemy.draw()
  }

  // Draw projectiles
  for (const projectile of projectiles) {
    projectile.draw()
  }

  // Draw flagpole
  drawFlagpole()

  // Draw house
  drawHouse()

  // Draw player
  player.draw()
}

function drawFlagpole() {
  stroke(139, 69, 19)
  strokeWeight(8)
  line(flagpole.x_pos, floorPosY, flagpole.x_pos, floorPosY - 200)
  noStroke()

  if (flagpole.isReached) {
    fill(255, 0, 0)
    triangle(
      flagpole.x_pos,
      floorPosY - 200,
      flagpole.x_pos,
      floorPosY - 170,
      flagpole.x_pos + 50,
      floorPosY - 185
    )
  } else {
    fill(255, 0, 0)
    triangle(
      flagpole.x_pos,
      floorPosY - 50,
      flagpole.x_pos,
      floorPosY - 20,
      flagpole.x_pos + 50,
      floorPosY - 35
    )
  }

  noStroke()
  fill(139, 69, 19)
  rect(flagpole.x_pos - 10, floorPosY, 20, 10)
}

function drawHouse() {
  // Roof
  fill(139, 69, 19) // Brown
  triangle(
    flagpole.x_pos + 100,
    floorPosY - 150,
    flagpole.x_pos + 200,
    floorPosY - 250,
    flagpole.x_pos + 300,
    floorPosY - 150
  )

  // // Body
  fill(255, 222, 173) // Light beige
  rect(flagpole.x_pos + 100, floorPosY - 150, 200, 150)

  // Window
  fill(173, 216, 230) // Light blue
  rect(flagpole.x_pos + 120, floorPosY - 130, 40, 40)
  rect(flagpole.x_pos + 240, floorPosY - 130, 40, 40)

  // Door
  fill(139, 69, 19) // Brown
  rect(flagpole.x_pos + 180, floorPosY - 60, 40, 60)
}

function checkFlagpole() {
  const playerPos = player.getPosition()
  if (dist(playerPos.x, playerPos.y, flagpole.x_pos, floorPosY) < 50) {
    if (!flagpole.isReached) {
      flagpole.isReached = true
      // Play victory sound effect
      if (typeof victorySound !== "undefined" && victorySound) {
        victorySound.play()
      }
      playVictoryMusic() // Switch to victory music
      gameManager.completeLevel()
    }
  }
}

// ============= INPUT HANDLING =============
/**
 * Handles continuous key input (called every frame)
 */
function handleContinuousInput() {
  if (!gameManager.isPlayable()) return
  if (player.isPlummeting) return

  // Movement
  if (keyStates["a"] || keyStates["A"] || keyStates["ArrowLeft"]) {
    player.move("left")
  } else if (keyStates["d"] || keyStates["D"] || keyStates["ArrowRight"]) {
    player.move("right")
  } else {
    player.move("stop")
  }
}

/**
 * Handles single key press events
 */
function keyPressed() {
  keyStates[key] = true

  // Game state controls
  if (key === "r" || key === "R") {
    if (gameManager.getGameState() === "gameOver") {
      gameManager.resetGame()
      resetGameWorld()
      startGame()
    } else {
      resetGameWorld()
      startGame()
    }
    return
  }

  if (key === "m" || key === "M") {
    // Toggle background music
    toggleBackgroundMusic()
    return
  }

  if (!gameManager.isPlayable()) return

  // Start background music on first user interaction (browser requirement)
  if (!bgMusicInitialized) {
    startBackgroundMusic()
  }

  // Jump
  if (key === "w" || key === "W" || keyCode === UP_ARROW) {
    player.jump()
  }

  // Throw stone
  if (key === " ") {
    // Spacebar
    throwStone()
  }
}

function keyReleased() {
  keyStates[key] = false
}

/**
 * Creates and throws a stone projectile
 */
function throwStone() {
  const playerPos = player.getPosition()

  if (!gameManager.canThrowStone()) return
  if (!(player.isLeft || player.isRight)) return

  // Try to throw stone (this will decrease stone count if successful)
  if (!gameManager.stoneThrown()) return

  // Determine throw direction based on recent movement
  let direction = 1
  if (player.isLeft) {
    direction = -1
  }

  // Create stone slightly in front of player
  const stoneX = playerPos.x + direction * 20
  const stoneY = playerPos.y - 30

  // Create projectile with some power variation
  const power = random(0.8, 1.2)
  const stone = new Projectile(stoneX, stoneY, direction, power)

  projectiles.push(stone)
}
