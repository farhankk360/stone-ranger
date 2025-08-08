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

let cameraPosX = 0
let cameraPosY = 0

// Background elements
let clouds
let sharpMountains = []
let rollingMountainLayers = []

// Input tracking
let keyStates = {}

// ============= GAME SETUP =============
function setup() {
  createCanvas(1024, 720)
  floorPosY = (height * 3) / 4
  floorWidth = width * 2

  // Initialize game state manager
  gameManager = new GameStateManager()

  // Create collectables
  initializeCollectables()

  // Create flagpole
  flagpole = { x_pos: 1900, isReached: false }

  // Create platforms using factory pattern
  platforms = [
    Platform(1124, height - floorPosY, -width, floorPosY),
    Platform(1410, height - floorPosY, 200, floorPosY),
    Platform(600, height - floorPosY, 1720, floorPosY),
    // Additional platforms for more interesting level design
    // Platform(200, 40, 500, floorPosY - 80),
    // Platform(200, 40, 600, floorPosY - 180),
    // Platform(200, 40, 700, floorPosY - 280),
    // Platform(200, 40, 800, floorPosY - 350),
    // Platform(200, 40, 900, floorPosY - 450),
    // // Platform(150, 30, 1300, floorPosY - 120),
  ]

  // Create enemies using constructor functions
  initializeEnemies()

  // Initialize background systems
  initializeSharpMountains()
  initializeRollingMountains()
  initializeClouds()

  startGame()
}

function initializeEnemies() {
  enemies = [
    new Enemy(400, floorPosY, 100, "walker"),
    new Enemy(1000, floorPosY, 150, "walker"),
    new Enemy(1400, floorPosY - 120, 80, "guard"), // Guard on platform
    new Enemy(700, floorPosY, 200, "jumper"),
    new Enemy(1600, floorPosY, 120, "walker"),
  ]
}

function initializeCollectables() {
  const collectablePositions = [
    { x: 100, y: floorPosY - 30 },
    { x: 800, y: floorPosY - 30 },
    { x: 1200, y: floorPosY - 30 },
    { x: 1500, y: floorPosY - 30 },
    { x: 1350, y: floorPosY - 100 }, // On platform
    { x: 650, y: floorPosY - 80 }, // Floating
  ]

  collectables = new Collectables(collectablePositions)
  gameManager.init(collectables.getCount())
}

function startGame() {
  // Create player using constructor function
  player = new Player(width / 2, floorPosY, floorPosY)

  cameraPosX = 0
  cameraPosY = 0

  gameManager.restartLevel()
}

function resetGameWorld() {
  // Reset all projectiles
  projectiles = []

  // Reset all enemies to initial state
  initializeEnemies()

  // Reset flagpole
  flagpole.isReached = false

  // Reset collectables
  initializeCollectables()
}

// ============= BACKGROUND INITIALIZATION =============
function initializeSharpMountains() {
  sharpMountains = [
    { x_pos: 200, y_pos: floorPosY, height: 400, width: 300 },
    { x_pos: 600, y_pos: floorPosY, height: 380, width: 240 },
    { x_pos: 1200, y_pos: floorPosY, height: 240, width: 180 },
    { x_pos: 1800, y_pos: floorPosY, height: 320, width: 220 },
    { x_pos: 2400, y_pos: floorPosY, height: 260, width: 190 },
  ]
}

function initializeRollingMountains() {
  rollingMountainLayers = [
    {
      color: [97, 165, 151],
      speed: 0.05,
      mountains: generateMountainSet(100, 2, 0.2, 0.2),
    },
    {
      color: [59, 146, 128],
      speed: 0.1,
      mountains: generateMountainSet(50, 10, 0.1, 0.1),
    },
  ]
}

/**
 * Generates a set of rolling mountains for parallax background
 * @param {number} seed - Random seed for generation
 * @param {number} numMountains - Number of mountains to generate
 * @param {number} minHeightRatio - Minimum height as ratio of canvas height
 * @param {number} maxHeightRatio - Maximum height as ratio of canvas height
 * @returns {Array} Array of mountain objects
 */
function generateMountainSet(
  seed,
  numMountains,
  minHeightRatio,
  maxHeightRatio
) {
  const mountains = []
  const spacing = (floorWidth * 1.5) / numMountains

  for (let i = 0; i < numMountains; i++) {
    const x = i * spacing + Math.sin(seed + i) * spacing * 0.3
    const width = 200 + Math.cos(seed * 2 + i) * 100
    const heightRatio =
      minHeightRatio +
      (maxHeightRatio - minHeightRatio) * (0.5 + Math.sin(seed + i * 2) * 0.5)

    mountains.push({
      x: x,
      width: width,
      height: height * heightRatio,
      baseY: floorPosY,
    })
  }

  return mountains
}

function initializeClouds() {
  clouds = []

  for (let i = 0; i < 25; i++) {
    const depth = Math.random() * 0.7 + 0.1
    clouds.push({
      x_pos: Math.random() * floorWidth * 2 - width,
      y_pos: Math.random() * 200 + 50,
      width: (Math.random() * 60 + 60) * depth,
      height: (Math.random() * 30 + 30) * depth,
      speed: depth * 0.3,
      opacity: 150 + depth * 100,
    })
  }
}

// ============= MAIN GAME LOOP =============
function draw() {
  // Sky gradient background
  drawSkyGradient()

  push()

  // Update and apply camera
  updateCamera()
  translate(-cameraPosX, -cameraPosY)

  // Draw background elements (back to front)
  drawSun()
  drawSharpMountains()
  drawRollingMountains()
  drawClouds()
  drawParallaxTrees()

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
 * Draws the sky gradient background
 */
function drawSkyGradient() {
  for (let i = 0; i <= height; i++) {
    const inter = map(i, 0, height * 0.7, 0, 1)
    const c = lerpColor(color(35, 206, 235), color(176, 224, 230), inter)
    stroke(c)
    line(0, i, width, i)
  }
}

/**
 * Updates camera position with smooth following
 */
function updateCamera() {
  const playerPos = player.getPosition()
  const newCameraPosX = playerPos.x - width / 2
  const newCameraPosY = playerPos.y - height * 0.6

  const minCameraPosX = -width
  const maxCameraPosX = floorWidth - width
  const boundedCameraPosX = constrain(
    newCameraPosX,
    minCameraPosX,
    maxCameraPosX
  )

  const minCameraPosY = -height * 0.2
  const maxCameraPosY = 0
  const boundedCameraPosY = constrain(
    newCameraPosY,
    minCameraPosY,
    maxCameraPosY
  )

  cameraPosX = cameraPosX * 0.95 + boundedCameraPosX * 0.05
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
      if (gameManager.loseLife()) {
        projectiles = [] // Clear all projectiles on game over
        return // Game over
      }
      projectiles = [] // Clear all projectiles on level restart
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
    if (gameManager.loseLife()) {
      projectiles = [] // Clear all projectiles on game over
      return // Game over
    }
    projectiles = [] // Clear all projectiles on level restart
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

  // Draw player
  player.draw()
}

/**
 * Draws the sun
 */
function drawSun() {
  fill(255, 230, 0)
  noStroke()
  ellipse(800, 100, 80, 80)

  // Sun rays
  stroke(255, 230, 0)
  strokeWeight(3)
  line(800, 50, 800, 30)
  line(850, 100, 870, 100)
  line(800, 150, 800, 170)
  line(750, 100, 730, 100)
  noStroke()
}

// ============= BACKGROUND DRAWING FUNCTIONS =============
function drawSharpMountains() {
  push()
  const parallaxOffset = -cameraPosX * 0.05
  translate(parallaxOffset, 0)

  for (const mountain of sharpMountains) {
    for (
      let offset = -floorWidth;
      offset <= floorWidth * 2;
      offset += floorWidth
    ) {
      drawSingleSharpMountain(
        mountain.x_pos + offset,
        mountain.y_pos,
        mountain.height,
        mountain.width
      )
    }
  }
  pop()
}

function drawSingleSharpMountain(x, y, h, w) {
  noStroke()

  // Main peak
  fill(120, 120, 140, 120)
  triangle(x, y, x + w / 2, y - h, x + w, y)

  // Secondary peak
  fill(100, 100, 120)
  triangle(x - 30, y, x + w / 4, y - h * 0.8, x + 80, y)

  // Snow cap
  fill(200, 200, 220)
  triangle(
    x + w / 2 - 20,
    y - h + 50,
    x + w / 2,
    y - h,
    x + w / 2 + 20,
    y - h + 50
  )
}

function drawRollingMountains() {
  for (const layer of rollingMountainLayers) {
    push()
    const parallaxOffset = -cameraPosX * layer.speed
    translate(parallaxOffset, 0)
    drawMountainSet(layer.color, layer.mountains)
    pop()
  }
}

function drawMountainSet(color, mountains) {
  fill(color[0], color[1], color[2])
  noStroke()

  for (const mountain of mountains) {
    for (
      let offset = -floorWidth;
      offset <= floorWidth * 2;
      offset += floorWidth * 1.5
    ) {
      drawSingleRollingMountain(
        mountain.x + offset,
        mountain.baseY,
        mountain.height,
        mountain.width
      )
    }
  }
}

function drawSingleRollingMountain(centerX, baseY, peakHeight, mountainWidth) {
  beginShape()
  vertex(centerX - mountainWidth, baseY)

  const steps = 20
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = centerX - mountainWidth + t * mountainWidth * 2
    const heightMultiplier = Math.exp(-Math.pow(t * 4 - 2, 2))
    const y = baseY - peakHeight * heightMultiplier
    vertex(x, y)
  }

  vertex(centerX + mountainWidth, baseY)
  vertex(centerX + mountainWidth, height)
  vertex(centerX - mountainWidth, height)
  endShape(CLOSE)
}

function drawClouds() {
  for (const cloud of clouds) {
    push()

    cloud.x_pos += cloud.speed
    if (cloud.x_pos > floorWidth + width + 200) {
      cloud.x_pos = Math.random() * -200 - 200
      cloud.y_pos = Math.random() * 200 + 50
    }

    fill(255, 255, 255, cloud.opacity)
    noStroke()

    ellipse(cloud.x_pos, cloud.y_pos, cloud.width * 0.7, cloud.height)
    ellipse(
      cloud.x_pos + 30,
      cloud.y_pos - 10,
      cloud.width * 0.6,
      cloud.height * 1.2
    )
    ellipse(cloud.x_pos + 60, cloud.y_pos, cloud.width * 0.8, cloud.height)
    ellipse(
      cloud.x_pos + 20,
      cloud.y_pos + 10,
      cloud.width * 0.9,
      cloud.height * 0.8
    )

    pop()
  }
}

function drawParallaxTrees() {
  // Background trees (slower parallax)
  const treesX = [300, 400, 600, 800, 900, 1050, 1100, 1300, 1600]
  push()
  const bgParallax = -cameraPosX * 0.05
  translate(bgParallax, 0)

  for (let i = 0; i < treesX.length; i += 2) {
    drawSingleTree(treesX[i], 0.6, true)
    drawSingleTree(treesX[i] + floorWidth, 0.6, true)
    drawSingleTree(treesX[i] - floorWidth, 0.6, true)
  }
  pop()

  // Foreground trees (no parallax)
  push()
  for (let i = 1; i < treesX.length; i += 2) {
    drawSingleTree(treesX[i], 1.0, false)
    drawSingleTree(treesX[i] + floorWidth, 1.0, false)
    drawSingleTree(treesX[i] - floorWidth, 1.0, false)
  }
  pop()
}

function drawSingleTree(x, scale, isBackground) {
  push()

  // Tree trunk
  noStroke()
  fill(isBackground ? 81 : 101, isBackground ? 54 : 67, isBackground ? 26 : 33)
  rect(x - 10 * scale, floorPosY - 100 * scale, 20 * scale, 100 * scale)

  // Tree foliage
  fill(0, isBackground ? 80 : 100, 0)

  triangle(
    x - 50 * scale,
    floorPosY - 100 * scale,
    x,
    floorPosY - 200 * scale,
    x + 50 * scale,
    floorPosY - 100 * scale
  )
  triangle(
    x - 45 * scale,
    floorPosY - 140 * scale,
    x,
    floorPosY - 230 * scale,
    x + 45 * scale,
    floorPosY - 140 * scale
  )
  triangle(
    x - 40 * scale,
    floorPosY - 180 * scale,
    x,
    floorPosY - 260 * scale,
    x + 40 * scale,
    floorPosY - 180 * scale
  )

  pop()
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

function checkFlagpole() {
  const playerPos = player.getPosition()
  if (dist(playerPos.x, playerPos.y, flagpole.x_pos, floorPosY) < 50) {
    if (!flagpole.isReached) {
      flagpole.isReached = true
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

  if (!gameManager.isPlayable()) return

  // Jump
  if (key === "w" || key === "W" || keyCode === UP_ARROW) {
    player.jump()
  }

  // Throw stone
  if (key === " ") {
    // Spacebar
    throwStone()
  }

  // Toggle controls display
  if (key === "h" || key === "H") {
    gameManager.toggleControls()
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
