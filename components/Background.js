/**
 * Background system for managing all background elements
 * Handles sky, sun, mountains, clouds, and trees
 */
function Background() {
  // Background element arrays
  this.clouds = []
  this.sharpMountains = []
  this.rollingMountainLayers = []
  this.treesX = [300, 400, 600, 800, 900, 1050, 1100, 1300, 1600]

  /**
   * Initialize all background elements
   * @param {number} floorPosY - Floor position Y coordinate
   * @param {number} floorWidth - Width of the floor
   * @param {number} height - Canvas height
   * @param {number} width - Canvas width
   */
  this.init = function (floorPosY, floorWidth, height, width) {
    this.floorPosY = floorPosY
    this.floorWidth = floorWidth
    this.height = height
    this.width = width

    this.initializeSharpMountains()
    this.initializeRollingMountains()
    this.initializeClouds()
  }

  /**
   * Initialize sharp mountain data
   */
  this.initializeSharpMountains = function () {
    this.sharpMountains = [
      { x_pos: 200, y_pos: this.floorPosY, height: 400, width: 300 },
      { x_pos: 600, y_pos: this.floorPosY, height: 380, width: 240 },
      { x_pos: 1200, y_pos: this.floorPosY, height: 240, width: 180 },
      { x_pos: 1800, y_pos: this.floorPosY, height: 320, width: 220 },
      { x_pos: 2400, y_pos: this.floorPosY, height: 260, width: 190 },
    ]
  }

  /**
   * Initialize rolling mountain layers for parallax effect
   */
  this.initializeRollingMountains = function () {
    this.rollingMountainLayers = [
      {
        color: [97, 165, 151],
        speed: 0.05,
        mountains: this.generateMountainSet(100, 2, 0.2, 0.2),
      },
      {
        color: [59, 146, 128],
        speed: 0.1,
        mountains: this.generateMountainSet(50, 10, 0.1, 0.1),
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
  this.generateMountainSet = function (
    seed,
    numMountains,
    minHeightRatio,
    maxHeightRatio
  ) {
    const mountains = []
    const spacing = (this.floorWidth * 1.5) / numMountains

    for (let i = 0; i < numMountains; i++) {
      const x = i * spacing + Math.sin(seed + i) * spacing * 0.3
      const width = 200 + Math.cos(seed * 2 + i) * 100
      const heightRatio =
        minHeightRatio +
        (maxHeightRatio - minHeightRatio) * (0.5 + Math.sin(seed + i * 2) * 0.5)

      mountains.push({
        x: x,
        width: width,
        height: this.height * heightRatio,
        baseY: this.floorPosY,
      })
    }

    return mountains
  }

  /**
   * Initialize cloud data
   */
  this.initializeClouds = function () {
    this.clouds = []

    for (let i = 0; i < 25; i++) {
      const depth = Math.random() * 0.7 + 0.1
      this.clouds.push({
        x_pos: Math.random() * this.floorWidth * 2 - this.width,
        y_pos: Math.random() * 200 + 50,
        width: (Math.random() * 60 + 60) * depth,
        height: (Math.random() * 30 + 30) * depth,
        speed: depth * 0.3,
        opacity: 150 + depth * 100,
      })
    }
  }

  /**
   * Draw all background elements in correct order (back to front)
   * @param {number} cameraPosX - Camera X position for parallax
   */
  this.drawAll = function (cameraPosX) {
    this.drawSkyGradient()
    this.drawSun()
    this.drawSharpMountains(cameraPosX)
    this.drawClouds()
    this.drawParallaxTrees(cameraPosX)
    this.drawRollingMountains(cameraPosX)
  }

  /**
   * Draws the sky gradient background
   */
  this.drawSkyGradient = function () {
    for (let i = 0; i <= this.height; i++) {
      const inter = map(i, 0, this.height * 0.7, 0, 1)
      const c = lerpColor(color(35, 206, 235), color(176, 224, 230), inter)
      stroke(c)
      line(0, i, this.width, i)
    }
  }

  /**
   * Draws the sun
   */
  this.drawSun = function () {
    const x = 900
    const y = 100

    fill(255, 230, 0)
    noStroke()
    ellipse(x, y, 60, 60)

    // Sun rays
    stroke(255, 230, 0)
    strokeWeight(3)
    line(900, 50, 900, 30)
    line(820, 100, 850, 100)
    line(900, 150, 900, 170)
    line(950, 100, 980, 100)
    noStroke()
  }

  /**
   * Draw sharp mountains with parallax effect
   * @param {number} cameraPosX - Camera X position
   */
  this.drawSharpMountains = function (cameraPosX) {
    push()
    const parallaxOffset = -cameraPosX * 0.05
    translate(parallaxOffset, 0)

    for (const mountain of this.sharpMountains) {
      for (
        let offset = -this.floorWidth;
        offset <= this.floorWidth * 2;
        offset += this.floorWidth
      ) {
        this.drawSingleSharpMountain(
          mountain.x_pos + offset,
          mountain.y_pos,
          mountain.height,
          mountain.width
        )
      }
    }
    pop()
  }

  /**
   * Draw a single sharp mountain
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} h - Height
   * @param {number} w - Width
   */
  this.drawSingleSharpMountain = function (x, y, h, w) {
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

  /**
   * Draw rolling mountains with parallax layers
   * @param {number} cameraPosX - Camera X position
   */
  this.drawRollingMountains = function (cameraPosX) {
    for (const layer of this.rollingMountainLayers) {
      push()
      const parallaxOffset = -cameraPosX * layer.speed
      translate(parallaxOffset, 0)
      this.drawMountainSet(layer.color, layer.mountains)
      pop()
    }
  }

  /**
   * Draw a set of mountains with given color
   * @param {Array} color - RGB color array
   * @param {Array} mountains - Array of mountain objects
   */
  this.drawMountainSet = function (color, mountains) {
    fill(color[0], color[1], color[2])
    noStroke()

    for (const mountain of mountains) {
      for (
        let offset = -this.floorWidth;
        offset <= this.floorWidth * 2;
        offset += this.floorWidth * 1.5
      ) {
        this.drawSingleRollingMountain(
          mountain.x + offset,
          mountain.baseY,
          mountain.height,
          mountain.width
        )
      }
    }
  }

  /**
   * Draw a single rolling mountain
   * @param {number} centerX - Center X position
   * @param {number} baseY - Base Y position
   * @param {number} peakHeight - Peak height
   * @param {number} mountainWidth - Mountain width
   */
  this.drawSingleRollingMountain = function (
    centerX,
    baseY,
    peakHeight,
    mountainWidth
  ) {
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
    vertex(centerX + mountainWidth, this.height)
    vertex(centerX - mountainWidth, this.height)
    endShape(CLOSE)
  }

  /**
   * Draw clouds with animation
   */
  this.drawClouds = function () {
    for (const cloud of this.clouds) {
      push()

      cloud.x_pos += cloud.speed
      if (cloud.x_pos > this.floorWidth + this.width + 200) {
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

  /**
   * Draw parallax trees
   * @param {number} cameraPosX - Camera X position
   */
  this.drawParallaxTrees = function (cameraPosX) {
    push()
    const bgParallax = -cameraPosX * 0.05
    translate(bgParallax, 0)

    for (let i = 0; i < this.treesX.length; i += 2) {
      this.drawSingleTree(this.treesX[i], 0.6, true)
      this.drawSingleTree(this.treesX[i] + this.floorWidth, 0.3, true)
      this.drawSingleTree(this.treesX[i] - this.floorWidth, 0.2, true)
    }

    for (let i = 1; i < this.treesX.length; i += 2) {
      this.drawSingleTree(this.treesX[i], 0.8, false)
      this.drawSingleTree(this.treesX[i] + this.floorWidth, 0.6, false)
      this.drawSingleTree(this.treesX[i] - this.floorWidth, 0.5, false)
    }
    pop()
  }

  /**
   * Draw a single tree
   * @param {number} x - X position
   * @param {number} scale - Scale factor
   * @param {boolean} isBackground - Whether tree is in background
   */
  this.drawSingleTree = function (x, scale, isBackground) {
    push()

    // Tree trunk
    noStroke()
    fill(
      isBackground ? 81 : 101,
      isBackground ? 54 : 67,
      isBackground ? 26 : 33
    )
    rect(x - 10 * scale, this.floorPosY - 100 * scale, 20 * scale, 100 * scale)

    // Tree foliage
    fill(0, isBackground ? 80 : 100, 0)

    triangle(
      x - 50 * scale,
      this.floorPosY - 100 * scale,
      x,
      this.floorPosY - 200 * scale,
      x + 50 * scale,
      this.floorPosY - 100 * scale
    )
    triangle(
      x - 45 * scale,
      this.floorPosY - 140 * scale,
      x,
      this.floorPosY - 230 * scale,
      x + 45 * scale,
      this.floorPosY - 140 * scale
    )
    triangle(
      x - 40 * scale,
      this.floorPosY - 180 * scale,
      x,
      this.floorPosY - 260 * scale,
      x + 40 * scale,
      this.floorPosY - 180 * scale
    )

    pop()
  }
}
