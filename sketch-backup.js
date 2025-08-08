// The Game Project Part 7 - Make it awesome!

var floorWidth
var gameChar_x
var gameChar_y
var floorPos_y

var isLeft
var isRight
var isFalling
var isPlummeting

var trees_x
var clouds
var collectables
var flagpole

var cameraPosX
var cameraPosY
var gameScore
var lives
var platforms

// New mountain systems
let sharpMountains = []
let rollingMountainLayers = []

function setup() {
  createCanvas(1024, 720)
  floorPos_y = (height * 3) / 4
  lives = 3
  floorWidth = width * 2

  trees_x = [300, 400, 600, 800, 900, 1050, 1100, 1300, 1600]

  collectables = [
    { x_pos: 100, y_pos: floorPos_y - 30, size: 40, isFound: false },
    { x_pos: 800, y_pos: floorPos_y - 30, size: 40, isFound: false },
    { x_pos: 1200, y_pos: floorPos_y - 30, size: 40, isFound: false },
    { x_pos: 1500, y_pos: floorPos_y - 30, size: 40, isFound: false },
  ]

  flagpole = { x_pos: 1900, isReached: false }

  // initial ground platforms
  platforms = [
    new Platform(1124, height - floorPos_y, -width, floorPos_y),
    new Platform(1410, height - floorPos_y, 200, floorPos_y),
    new Platform(600, height - floorPos_y, 1720, floorPos_y),

    // just a staircase test example
    // new Platform(200, 50, 112, floorPos_y - 70),
    // new Platform(200, 40, -100, floorPos_y - 180),
    // new Platform(200, 40, -200, floorPos_y - 280),
  ]

  // Initialize new mountain systems
  initializeSharpMountains()
  initializeRollingMountains()
  initializeClouds()

  startGame()
}

function initializeSharpMountains() {
  // Sharp mountain peaks for far background (your original style)
  sharpMountains = [
    { x_pos: 200, y_pos: floorPos_y, height: 400, width: 300 },
    { x_pos: 600, y_pos: floorPos_y, height: 380, width: 240 },
    { x_pos: 1200, y_pos: floorPos_y, height: 240, width: 180 },
    { x_pos: 1800, y_pos: floorPos_y, height: 320, width: 220 },
    { x_pos: 2400, y_pos: floorPos_y, height: 260, width: 190 },
  ]
}

function initializeRollingMountains() {
  // 5 layers of rolling mountains - Option 1: Solid colors
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

function generateMountainSet(
  seed,
  numMountains,
  minHeightRatio,
  maxHeightRatio
) {
  let mountains = []
  let spacing = (floorWidth * 1.5) / numMountains // Use game's floorWidth

  for (let i = 0; i < numMountains; i++) {
    let x = i * spacing + Math.sin(seed + i) * spacing * 0.3
    let width = 200 + Math.cos(seed * 2 + i) * 100
    let heightRatio =
      minHeightRatio +
      (maxHeightRatio - minHeightRatio) * (0.5 + Math.sin(seed + i * 2) * 0.5)

    mountains.push({
      x: x,
      width: width,
      height: height * heightRatio,
      baseY: floorPos_y,
    })
  }

  return mountains
}

function initializeClouds() {
  clouds = []

  // Create clouds at different depths for parallax
  for (let i = 0; i < 25; i++) {
    let depth = Math.random() * 0.7 + 0.1
    clouds.push({
      x_pos: Math.random() * floorWidth * 2 - width,
      y_pos: Math.random() * 200 + 50,
      width: (Math.random() * 60 + 60) * depth,
      height: (Math.random() * 30 + 30) * depth,
      speed: depth * 0.3,
      opacity: 150 + depth * 100,
      parallaxSpeed: depth * 0.2,
    })
  }
}

function startGame() {
  gameChar_x = width / 2
  gameChar_y = floorPos_y
  gameScore = 0

  for (var i = 0; i < collectables.length; i++) {
    if (collectables[i].isFound) {
      gameScore += 1
    }
  }

  isLeft = false
  isRight = false
  isFalling = false
  isPlummeting = false

  cameraPosX = 0
  cameraPosY = 0
}

function draw() {
  // Sky gradient
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height * 0.7, 0, 1)
    let c = lerpColor(color(35, 206, 235), color(176, 224, 230), inter)
    stroke(c)
    line(0, i, width, i)
  }

  push()

  // Smooth camera movement with boundaries
  const newCameraPosX = gameChar_x - width / 2
  const newCameraPosY = gameChar_y - height * 0.6

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

  translate(-cameraPosX, -cameraPosY)

  // sun
  fill(255, 230, 0)
  noStroke()
  ellipse(800, 100, 80, 80)
  // sun rays
  stroke(255, 230, 0)
  strokeWeight(3)
  line(800, 50, 800, 30)
  line(850, 100, 870, 100)
  line(800, 150, 800, 170)
  line(750, 100, 730, 100)
  noStroke()

  // Draw new mountain system layers (back to front)
  drawSharpMountains() // Farthest back
  drawRollingMountains() // Rolling hills layers
  drawParallaxClouds() // Clouds
  drawParallaxTrees() // Trees (background + foreground)

  isFalling = true
  // Draw ground using platforms
  for (let i = 0; i < platforms.length; i++) {
    platforms[i].drawPlatform()

    if (platforms[i].isContact() && !isPlummeting) {
      isFalling = false
    }
  }

  if (isFalling) {
    gameChar_y += 5

    if (gameChar_y - 5 > floorPos_y) {
      isPlummeting = true
      isLeft = false
      isRight = false
    }
  }

  for (var i = 0; i < collectables.length; i++) {
    drawCollectable(collectables[i])
    checkCollectable(collectables[i])
  }

  drawFlagpole()
  drawGameCharacter()

  pop()

  drawUI()

  if (lives < 1) {
    fill(255, 0, 0)
    textSize(50)
    textAlign(CENTER, CENTER)
    text("Game Over", width / 2, height / 2)
    return
  }

  if (flagpole.isReached) {
    fill(0, 255, 0)
    textSize(50)
    textAlign(CENTER, CENTER)
    text("Level Complete", width / 2, height / 2)
    return
  }

  if (!flagpole.isReached) {
    checkFlagpole()
  }

  checkPlayerDie()

  if (isLeft) {
    if (gameChar_x > -width) {
      gameChar_x -= 5
    }
  }

  if (isRight) {
    if (gameChar_x < floorWidth) {
      gameChar_x += 5
    }
  }
}

function drawSharpMountains() {
  push()
  let parallaxOffset = -cameraPosX * 0.05 // Very slow for far background
  translate(parallaxOffset, 0)

  for (let mountain of sharpMountains) {
    // Draw mountains across extended view
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

  // Main peak - very faded for distance
  fill(120, 120, 140, 120)
  triangle(x, y, x + w / 2, y - h, x + w, y)

  // Secondary peak
  fill(100, 100, 120)
  triangle(x - 30, y, x + w / 4, y - h * 0.8, x + 80, y)

  // Snow cap - very faint
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
  for (let i = 0; i < rollingMountainLayers.length; i++) {
    push()
    let parallaxOffset = -cameraPosX * rollingMountainLayers[i].speed
    translate(parallaxOffset, 0)

    drawMountainSet(
      rollingMountainLayers[i].color,
      rollingMountainLayers[i].mountains
    )
    pop()
  }
}

function drawMountainSet(color, mountains) {
  fill(color[0], color[1], color[2])
  noStroke()

  for (let mountain of mountains) {
    // Draw mountains across extended view for infinite effect
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

  // Create smooth mountain curve using bell curve
  let steps = 20
  for (let i = 0; i <= steps; i++) {
    let t = i / steps
    let x = centerX - mountainWidth + t * mountainWidth * 2

    let heightMultiplier = Math.exp(-Math.pow(t * 4 - 2, 2))
    let y = baseY - peakHeight * heightMultiplier

    vertex(x, y)
  }

  vertex(centerX + mountainWidth, baseY)
  vertex(centerX + mountainWidth, height)
  vertex(centerX - mountainWidth, height)
  endShape(CLOSE)
}

function drawParallaxClouds() {
  for (let cloud of clouds) {
    push()

    let parallaxOffset = -cameraPosX * cloud.parallaxSpeed
    translate(parallaxOffset, 0)

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
  push()
  let bgParallax = -cameraPosX * 0.05
  translate(bgParallax, 0)

  for (let i = 0; i < trees_x.length; i += 2) {
    drawSingleTree(trees_x[i], 0.6, true)
    // Draw additional for infinite effect
    drawSingleTree(trees_x[i] + floorWidth, 0.6, true)
    drawSingleTree(trees_x[i] - floorWidth, 0.6, true)
  }
  pop()

  // Foreground trees (faster parallax)
  push()
  let fgParallax = -cameraPosX * 0.0
  translate(fgParallax, 0)

  for (let i = 1; i < trees_x.length; i += 2) {
    drawSingleTree(trees_x[i], 1.0, false)
    // Draw additional for infinite effect
    drawSingleTree(trees_x[i] + floorWidth, 1.0, false)
    drawSingleTree(trees_x[i] - floorWidth, 1.0, false)
  }
  pop()
}

function drawSingleTree(x, scale, isBackground) {
  push()

  // Tree trunk
  noStroke()
  if (isBackground) {
    fill(81, 54, 26)
  } else {
    fill(101, 67, 33)
  }
  rect(x - 10 * scale, floorPos_y - 100 * scale, 20 * scale, 100 * scale)

  // Tree foliage
  if (isBackground) {
    fill(0, 80, 0)
  } else {
    fill(0, 100, 0)
  }

  triangle(
    x - 50 * scale,
    floorPos_y - 100 * scale,
    x,
    floorPos_y - 200 * scale,
    x + 50 * scale,
    floorPos_y - 100 * scale
  )
  triangle(
    x - 45 * scale,
    floorPos_y - 140 * scale,
    x,
    floorPos_y - 230 * scale,
    x + 45 * scale,
    floorPos_y - 140 * scale
  )
  triangle(
    x - 40 * scale,
    floorPos_y - 180 * scale,
    x,
    floorPos_y - 260 * scale,
    x + 40 * scale,
    floorPos_y - 180 * scale
  )

  pop()
}

// Rest of your original game functions remain the same...
function Platform(w, h, x, y) {
  this.w = w
  this.h = h
  this.x = x
  this.y = y

  const stones = []

  for (let i = 0; i < 15; i++) {
    stones.push({
      x: Math.random() * (this.w - 34) + this.x + 10,
      y: Math.random() * (this.h - 34) + this.y + 10,
      w: Math.random() * 12 + 12,
      h: Math.random() * 12 + 12,
    })
  }

  this.drawPlatform = function () {
    push()

    fill(124, 75, 43)
    rect(this.x, this.y, this.w, this.h)

    fill(180, 109, 64)
    strokeWeight(1)
    stroke(141, 84, 48)

    for (let stone of stones) {
      ellipse(stone.x, stone.y, stone.w, stone.h)
    }

    fill(119, 225, 49)
    strokeWeight(4)
    stroke(94, 188, 62)

    beginShape()
    vertex(this.x, this.y)

    for (let x = this.x; x <= this.x + this.w; x += 8) {
      let t = (x - this.x) / this.w
      let wave1 = sin(t * TWO_PI * 2.5) * 6
      let wave2 = cos(t * TWO_PI * 6) * 3
      let wave3 = sin(t * TWO_PI * 10) * 1.5
      let wave4 = cos(t * TWO_PI * 4.5) * 4

      let grassY = this.y + 40 - (wave1 + wave2 + wave3 + wave4)
      vertex(x, grassY)
    }

    vertex(this.x + this.w, this.y)
    endShape(CLOSE)

    pop()
  }

  this.isContact = function () {
    if (
      gameChar_x + 5 > this.x &&
      gameChar_x - 5 < this.x + this.w &&
      gameChar_y > this.y &&
      gameChar_y < this.y + this.h - 25
    ) {
      return true
    } else {
      return false
    }
  }
}

function drawGameCharacter() {
  if (isLeft && isFalling) {
    fill(56, 229, 140)
    ellipse(gameChar_x - 2, gameChar_y - 30, 18, 30)
    fill(255, 200, 150)
    ellipse(gameChar_x - 5, gameChar_y - 50, 25, 25)
    fill(0)
    ellipse(gameChar_x - 10, gameChar_y - 50, 4, 4)
    stroke(56, 229, 140)
    strokeWeight(4)
    line(gameChar_x - 2, gameChar_y - 35, gameChar_x - 15, gameChar_y - 40)
    stroke(100, 100, 255)
    line(gameChar_x - 2, gameChar_y - 15, gameChar_x - 12, gameChar_y - 10)
    line(gameChar_x + 2, gameChar_y - 15, gameChar_x + 8, gameChar_y - 5)
    noStroke()
  } else if (isRight && isFalling) {
    fill(56, 229, 140)
    ellipse(gameChar_x + 2, gameChar_y - 30, 18, 30)
    fill(255, 200, 150)
    ellipse(gameChar_x + 5, gameChar_y - 50, 25, 25)
    fill(0)
    ellipse(gameChar_x + 10, gameChar_y - 50, 4, 4)
    stroke(56, 229, 140)
    strokeWeight(4)
    line(gameChar_x + 2, gameChar_y - 35, gameChar_x + 15, gameChar_y - 40)
    stroke(100, 100, 255)
    line(gameChar_x - 2, gameChar_y - 15, gameChar_x - 8, gameChar_y - 5)
    line(gameChar_x + 2, gameChar_y - 15, gameChar_x + 12, gameChar_y - 10)
    noStroke()
  } else if (isLeft) {
    fill(56, 229, 140)
    ellipse(gameChar_x - 2, gameChar_y - 25, 18, 35)
    fill(255, 200, 150)
    ellipse(gameChar_x - 5, gameChar_y - 45, 25, 25)
    fill(0)
    ellipse(gameChar_x - 10, gameChar_y - 45, 4, 4)
    stroke(56, 229, 140)
    strokeWeight(4)
    line(gameChar_x - 2, gameChar_y - 30, gameChar_x - 12, gameChar_y - 20)
    stroke(100, 100, 255)
    line(gameChar_x - 2, gameChar_y - 10, gameChar_x - 10, gameChar_y)
    line(gameChar_x + 2, gameChar_y - 10, gameChar_x + 5, gameChar_y)
    noStroke()
  } else if (isRight) {
    fill(56, 229, 140)
    ellipse(gameChar_x + 2, gameChar_y - 25, 18, 35)
    fill(255, 200, 150)
    ellipse(gameChar_x + 5, gameChar_y - 45, 25, 25)
    fill(0)
    ellipse(gameChar_x + 10, gameChar_y - 45, 4, 4)
    stroke(56, 229, 140)
    strokeWeight(4)
    line(gameChar_x + 2, gameChar_y - 30, gameChar_x + 12, gameChar_y - 20)
    stroke(100, 100, 255)
    line(gameChar_x - 2, gameChar_y - 10, gameChar_x - 5, gameChar_y)
    line(gameChar_x + 2, gameChar_y - 10, gameChar_x + 10, gameChar_y)
    noStroke()
  } else if (isFalling || isPlummeting) {
    fill(56, 229, 140)
    ellipse(gameChar_x, gameChar_y - 30, 20, 30)
    fill(255, 200, 150)
    ellipse(gameChar_x, gameChar_y - 50, 25, 25)
    fill(0)
    ellipse(gameChar_x - 5, gameChar_y - 50, 4, 4)
    ellipse(gameChar_x + 5, gameChar_y - 50, 4, 4)
    stroke(56, 229, 140)
    strokeWeight(4)
    line(gameChar_x - 10, gameChar_y - 35, gameChar_x - 15, gameChar_y - 45)
    line(gameChar_x + 10, gameChar_y - 35, gameChar_x + 15, gameChar_y - 45)
    stroke(100, 100, 255)
    line(gameChar_x - 5, gameChar_y - 15, gameChar_x - 10, gameChar_y - 5)
    line(gameChar_x + 5, gameChar_y - 15, gameChar_x + 10, gameChar_y - 5)
    noStroke()
  } else {
    fill(56, 229, 140)
    ellipse(gameChar_x, gameChar_y - 25, 20, 35)
    fill(255, 200, 150)
    ellipse(gameChar_x, gameChar_y - 45, 25, 25)
    fill(0)
    ellipse(gameChar_x - 5, gameChar_y - 45, 4, 4)
    ellipse(gameChar_x + 5, gameChar_y - 45, 4, 4)
    stroke(56, 229, 140)
    strokeWeight(4)
    line(gameChar_x - 10, gameChar_y - 30, gameChar_x - 15, gameChar_y - 20)
    line(gameChar_x + 10, gameChar_y - 30, gameChar_x + 15, gameChar_y - 20)
    stroke(100, 100, 255)
    line(gameChar_x - 5, gameChar_y - 10, gameChar_x - 5, gameChar_y)
    line(gameChar_x + 5, gameChar_y - 10, gameChar_x + 5, gameChar_y)
    noStroke()
  }
}

function drawCollectable(t_collectable) {
  if (!t_collectable.isFound) {
    stroke(0)
    strokeWeight(1)
    fill(255, 215, 0)
    ellipse(
      t_collectable.x_pos,
      t_collectable.y_pos,
      t_collectable.size,
      t_collectable.size
    )
    fill(255, 180, 0)
    ellipse(
      t_collectable.x_pos,
      t_collectable.y_pos,
      t_collectable.size * 0.75,
      t_collectable.size * 0.75
    )
    noStroke()
    fill(255, 240, 0)
    textSize(t_collectable.size * 0.5)
    textAlign(CENTER, CENTER)
    text("$", t_collectable.x_pos, t_collectable.y_pos)
    textAlign(LEFT)
    textSize(12)
  }
}

function checkCollectable(t_collectable) {
  if (
    !t_collectable.isFound &&
    dist(gameChar_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < 50
  ) {
    t_collectable.isFound = true
    gameScore++
  }
}

function drawFlagpole() {
  stroke(139, 69, 19)
  strokeWeight(8)
  line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 200)
  noStroke()
  if (flagpole.isReached) {
    fill(255, 0, 0)
    triangle(
      flagpole.x_pos,
      floorPos_y - 200,
      flagpole.x_pos,
      floorPos_y - 170,
      flagpole.x_pos + 50,
      floorPos_y - 185
    )
  } else {
    fill(255, 0, 0)
    triangle(
      flagpole.x_pos,
      floorPos_y - 50,
      flagpole.x_pos,
      floorPos_y - 20,
      flagpole.x_pos + 50,
      floorPos_y - 35
    )
  }
  noStroke()
  fill(139, 69, 19)
  rect(flagpole.x_pos - 10, floorPos_y, 20, 10)
}

function checkFlagpole() {
  if (dist(gameChar_x, gameChar_y, flagpole.x_pos, floorPos_y) < 50) {
    flagpole.isReached = true
  }
}

function checkPlayerDie() {
  if (gameChar_y > height) {
    lives--
    if (lives > 0) {
      startGame()
    }
  }
}

function drawUI() {
  fill(0)
  textSize(20)
  textAlign(LEFT)
  text("Score: " + gameScore, 20, 30)
  fill(0)
  text("Lives: ", 20, 60)
  for (var i = 0; i < lives; i++) {
    var size = 16
    var x = 90 + i * 30
    var y = 48
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
}

function keyPressed() {
  if (lives < 1 || flagpole.isReached || isPlummeting) return
  if (keyCode === 65 || keyCode === 37) {
    isLeft = true
  }
  if (keyCode === 68 || keyCode === 39) {
    isRight = true
  }
  if ((keyCode === 87 || keyCode === 38 || keyCode === 32) && !isFalling) {
    gameChar_y -= 125
  }
}

function keyReleased() {
  if (lives < 1 || flagpole.isReached) return
  if (keyCode === 65 || keyCode === 37) {
    isLeft = false
  }
  if (keyCode === 68 || keyCode === 39) {
    isRight = false
  }
}
