const canvas = document.createElement('CANVAS')
const ctx = canvas.getContext('2d')

const scale = 20
const gridSize = new CreateVector(15, 15)

const fps = 10 //if above monitors refresh rate whole game will throttle causing the game to be "easier" or run slower
const fpsinterval = 1000 / fps
let then = performance.now() - fpsinterval

let startCooldown = 0
let snake
let food
let highscore = parseInt(localStorage.getItem('Snake-Game/Highscore'), 10) || 0
let maxTextWidth = 0
let Stylish = false

document.body.appendChild(canvas)
canvas.width = innerWidth
canvas.height = innerHeight

/*
TODO:

-find a better way to get the maxTextWidth
-fix movement, can't be going left then doing up and down same movement frame, will go up then try to buffer down instead of only doing down

*/

class Snake {
	constructor() {
		this.pos = new CreateVector(Math.floor(Math.random() * gridSize.x) * scale + scale, Math.floor(Math.random() * gridSize.y) * scale + scale)
		this.vel = new CreateVector()
		this.direction
		this.directionBuffer
		this.directionChangeCooldown = false
		this.bufferMade = true
		this.tail = []

		//Finds out which way to move the snake at start depending on the farthest wall it is from
		const distanceToWall = {
			'ArrowRight': gridSize.x * scale - this.pos.x,
			'ArrowLeft': gridSize.x * scale - (gridSize.x * scale - this.pos.x) - scale,
			'ArrowDown': gridSize.y * scale - this.pos.y,
			'ArrowUp': gridSize.y * scale - (gridSize.y * scale - this.pos.y) - scale,
		}
		let maxDistanceToWall = null

		for (var key in distanceToWall) {
			if (distanceToWall.hasOwnProperty(key)) {
				if (distanceToWall[key] > distanceToWall[maxDistanceToWall] || maxDistanceToWall === null) {
					maxDistanceToWall = key
				}
			}
		}
		this.direction = maxDistanceToWall
	}

	death() {
		if (this.pos.x > scale * gridSize.x || this.pos.x < scale || this.pos.y > scale * gridSize.y || this.pos.y < scale) {
			startGame()
		}
		this.tail.forEach((segment) => {
			if (segment.x === this.pos.x && segment.y === this.pos.y) {
				startGame()
			}
		})
	}

	update() {
		this.vel.mult(0)
		if (this.direction === 'ArrowRight') {
			this.vel.add(new CreateVector(1, 0))
		} else if (this.direction === 'ArrowLeft') {
			this.vel.add(new CreateVector(-1, 0))
		} else if (this.direction === 'ArrowUp') {
			this.vel.add(new CreateVector(0, -1))
		} else if (this.direction === 'ArrowDown') {
			this.vel.add(new CreateVector(0, 1))
		}
		this.pos.add(this.vel.mult(scale))
		if (this.pos.x === food.pos.x && this.pos.y === food.pos.y) {
			this.tail.push(new CreateVector(this.pos.x - this.vel.x, this.pos.y - this.vel.y))
			food = new Food()
			if (food.noSpace === true) {
				startGame()
			}
		} else {
			for (let index = 0; index < this.tail.length - 1; index++) {
				this.tail[index] = this.tail[index + 1]
			}
			if (this.tail.length > 0) {
				this.tail[this.tail.length - 1] = new CreateVector(this.pos.x - this.vel.x, this.pos.y - this.vel.y)
			}
		}
		this.death()
		this.bufferMade = true
		this.directionChangeCooldown = false
		if (this.directionBuffer != null) {
			this.direction = this.directionBuffer
			this.directionBuffer = null
			this.bufferMade = false
		}
	}

	draw() {
		ctx.fillStyle = '#228B22'
		this.tail.forEach((segment) => {
			ctx.fillRect(segment.x, segment.y, scale, scale)
		})
		ctx.fillRect(this.pos.x, this.pos.y, scale, scale)

		if (Stylish === true) {
			//Drawing Eye on snake
			ctx.beginPath()
			ctx.arc(this.pos.x + scale / 2, this.pos.y + scale / 2, scale / 3, 0, 2 * Math.PI)
			ctx.fillStyle = '#ffffff'
			ctx.fill()
			ctx.arc(this.pos.x + scale / 2, this.pos.y + scale / 2, scale / 3, 0, 2 * Math.PI)
			ctx.stroke()
			ctx.beginPath()
			ctx.arc(this.pos.x + scale / 2, this.pos.y + scale / 2, scale / 5, 0, 2 * Math.PI)
			ctx.fillStyle = '#000000'
			ctx.fill()
			ctx.beginPath()
			ctx.arc(this.pos.x + scale / 2, this.pos.y + scale / 2, scale / 6, 0, 2 * Math.PI)
			ctx.fillStyle = '#03A9F4'
			ctx.fill()
			ctx.beginPath()
			ctx.arc(this.pos.x + scale / 2, this.pos.y + scale / 2, scale / 10, 0, 2 * Math.PI)
			ctx.fillStyle = '#000000'
			ctx.fill()
		}
	}
}

class Food {
	constructor() {
		this.pos = new CreateVector()
		this.noSpace = false

		if (gridSize.x * gridSize.y - (snake.tail.length + 1) > 0) {
			let OccupiedSpace = true
			let position
			while (OccupiedSpace === true) {
				OccupiedSpace = false
				position = new CreateVector(Math.floor(Math.random() * gridSize.x) * scale + scale, Math.floor(Math.random() * gridSize.y) * scale + scale)
				if (OccupiedSpace === false) {
					if (snake.pos.x === position.x && snake.pos.y === position.y) {
						OccupiedSpace = true
						continue
					}
				}
				for (let index = 0; index < snake.tail.length; index++) {
					if (snake.tail[index].x === position.x && snake.tail[index].y === position.y) {
						OccupiedSpace = true
						break
					}
				}
			}
			this.pos.add(position)
		} else {
			this.noSpace = true
			UpdateText()
		}
	}

	draw() {
		ctx.fillStyle = '#DC143C'
		if (Stylish === true) {
			//Advanced Apple
			ctx.fillRect(this.pos.x + scale * 0.25, this.pos.y + scale * 0.25 + scale * 0.1, scale - scale * 0.5, scale - scale * 0.5)
			ctx.fillStyle = '#006400'
			ctx.fillRect(this.pos.x + scale * 0.45, this.pos.y + scale * 0.15, scale * 0.1, scale * 0.2)
		} else {
			//Basic Apple
			ctx.fillRect(this.pos.x, this.pos.y, scale, scale)
		}
	}
}

function animate() {
	requestAnimationFrame(animate)
	
	const now = performance.now()
	const elapsedTime = now - then
	if (elapsedTime > fpsinterval) {
		then = now - (elapsedTime % fpsinterval)
		
		ctx.clearRect(0, 0, Math.max(gridSize.x * scale + scale + scale, maxTextWidth), gridSize.y * scale + scale + scale * 4)
		ctx.fillStyle = '#000000'
		ctx.fillRect(0, 0, Math.max(gridSize.x * scale + scale + scale, maxTextWidth), gridSize.y * scale + scale + scale * 4)
		ctx.fillStyle = '#ffffff'
		ctx.fillRect(scale, scale, gridSize.x * scale, gridSize.y * scale)
		if (startCooldown > 0) {
			startCooldown -= 1
		} else {
			snake.update()
		}
		food.draw()
		snake.draw()
		UpdateText()
	}
}

function startGame() {
	startCooldown = 1000 / fpsinterval
	snake = new Snake()
	food = new Food()
}

function UpdateText() {
	if (snake.tail.length > highscore) {
		highscore = snake.tail.length
		localStorage.setItem('Snake-Game/Highscore', highscore.toString())
	}
	ctx.font = scale + 'px Arial'
	ctx.fillStyle = '#ffffff'
	const scoreText = `Score: ${snake.tail.length}`
	const highScoreText = `High score: ${highscore}`
	const gridSizeText = `Grid size: ${gridSize.x}, ${gridSize.y}`
	const longestText = Math.max(ctx.measureText(scoreText).width, ctx.measureText(highScoreText).width, ctx.measureText(gridSizeText).width) + scale
	ctx.fillText(scoreText, scale, scale * gridSize.y + scale + scale)
	ctx.fillText(highScoreText, scale, scale * gridSize.y + scale + scale * 2)
	ctx.fillText(gridSizeText, scale, scale * gridSize.y + scale + scale * 3)
	if (longestText > maxTextWidth) {
		maxTextWidth = longestText
	}
}

addEventListener('keydown', (event) => {
	let directionKey
	if (event.key === 'r') {
		startGame()
		return
	} else if (event.key === 'q') {
		vectorToChange = (vectorToChange === 'x') ? vectorToChange = 'y' : vectorToChange = 'x'
		return
	} else if (event.key === 'w' || event.key === 'ArrowUp') {
		directionKey = 'ArrowUp'
	} else if (event.key === 'a' || event.key === 'ArrowLeft') {
		directionKey = 'ArrowLeft'
	} else if (event.key === 's' || event.key === 'ArrowDown') {
		directionKey = 'ArrowDown'
	} else if (event.key === 'd' || event.key === 'ArrowRight') {
		directionKey = 'ArrowRight'
	} else if (event.key === 't') {
		Stylish = (Stylish === true) ? false : true
	}
	if (snake.tail.length > 0) {
		if (directionKey === 'ArrowUp' && snake.direction === 'ArrowDown' || directionKey === 'ArrowDown' && snake.direction === 'ArrowUp' || directionKey === 'ArrowRight' && snake.direction === 'ArrowLeft' || directionKey === 'ArrowLeft' && snake.direction === 'ArrowRight') {
			return
		}
	}
	if (snake.bufferMade === false) {
		snake.directionChangeCooldown = true
	}
	if (snake.directionChangeCooldown === true) {
		if (directionKey != snake.direction) {
			snake.directionBuffer = directionKey
		}
	} else if (directionKey != null) {
		snake.direction = directionKey
		snake.directionChangeCooldown = true
		if (startCooldown > 0) {
			startCooldown = 0
		}
	}
})

//Changable grid size for debugging
let vectorToChange = 'x'

addEventListener('click', () => {
	if (vectorToChange === 'x') {
		if (gridSize.x > 2) {
			gridSize.x -= 1
		}
	} else {
		if (gridSize.y > 2) {
			gridSize.y -= 1
		}
	}
	resize()
	startGame()
})

addEventListener('contextmenu', (event) => {
	event.preventDefault()
	if (vectorToChange === 'x') {
		gridSize.x += 1
	} else {
		gridSize.y += 1
	}
	resize()
	startGame()
})

addEventListener('resize', resize)

function resize() {
	const usedSpace = new CreateVector(Math.max(gridSize.x * scale + scale + scale, maxTextWidth), gridSize.y * scale + scale + scale * 4)
	const scl = Math.min(innerWidth/usedSpace.x, innerHeight/usedSpace.y)
	canvas.width = innerWidth
	canvas.height = innerHeight
	ctx.scale(scl, scl)
}

startGame()
resize()
animate()