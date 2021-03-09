const canvas = document.createElement("CANVAS")
const ctx = canvas.getContext('2d')

const scale = 20
const gridSize = new CreateVector(15, 15)

const fps = 10 //if above monitors refresh rate whole game will throttle causing the game to be "easier" or run slower
const fpsinterval = 1000 / fps
let then = performance.now() - fpsinterval

let startCooldown = 0
let snake
let food
let highscore = 0
let maxTextWidth = 0

document.body.appendChild(canvas)
canvas.width = innerWidth
canvas.height = innerHeight

/*
TODO:

-find a better way to get the maxTextWidth
-create variables for the clearRect etc that use "magic numbers" (ex. a variable called gamearea with x and y)
-fix movement, can't be going left then doing up and down same movement frame, will go up then try to buffer down instead of only doing down

*/

function Snake() {
	this.x = Math.floor(Math.random() * gridSize.x) * scale + scale
	this.y = Math.floor(Math.random() * gridSize.y) * scale + scale
	this.direction
	this.directionChangeCooldown = false
	this.bufferMade = true
	this.directionBuffer
	this.xspeed
	this.yspeed
	this.tail = []

	const distanceToWall = {
		"ArrowRight": gridSize.x * scale - this.x,
		"ArrowLeft": gridSize.x * scale - (gridSize.x * scale - this.x) - scale,
		"ArrowDown": gridSize.y * scale - this.y,
		"ArrowUp": gridSize.y * scale - (gridSize.y * scale - this.y) - scale,
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
	
	this.death = () => {
		if (this.x > scale * gridSize.x || this.x < scale || this.y > scale * gridSize.y || this.y < scale) {
			startGame()
		}
		this.tail.forEach((segment) => {
			if (segment.x === this.x && segment.y === this.y) {
				startGame()
			}
		})
	}

	this.update = () => {
		if (this.direction === 'ArrowRight') {
			this.xspeed = 1
			this.yspeed = 0
		} else if (this.direction === 'ArrowLeft') {
			this.xspeed = -1
			this.yspeed = 0
		} else if (this.direction === 'ArrowUp') {
			this.xspeed = 0
			this.yspeed = -1
		} else if (this.direction === 'ArrowDown') {
			this.xspeed = 0
			this.yspeed = 1
		}
		this.x += this.xspeed * scale
		this.y += this.yspeed * scale
		if (this.x === food.x && this.y === food.y) {
			this.tail.push(new CreateVector(this.x - this.xspeed * scale, this.y - this.yspeed * scale))
			food = new Food()
			if (food.noSpace === true) {
				startGame()
			}
		} else {
			for (index = 0; index < this.tail.length - 1; index++) {
				this.tail[index] = this.tail[index + 1]
			}
			if (this.tail.length > 0) {
				this.tail[this.tail.length - 1] = new CreateVector(this.x - this.xspeed * scale, this.y - this.yspeed * scale)
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
	
	this.draw = () => {
		ctx.fillStyle = '#228B22'
		this.tail.forEach((segment) => {
			ctx.fillRect(segment.x, segment.y, scale, scale)
		})
		ctx.fillRect(this.x, this.y, scale, scale)
	}
}

function CreateVector(x, y) {
	this.x = x
	this.y = y
}


function Food() {
	this.x
	this.y
	this.noSpace = false

	if (gridSize.x * gridSize.y - (snake.tail.length + 1) > 0) {
		let OccupiedSpace = true
		let position
		while (OccupiedSpace === true) {
			OccupiedSpace = false
			position = new CreateVector(Math.floor(Math.random() * gridSize.x) * scale + scale, Math.floor(Math.random() * gridSize.y) * scale + scale)
			if (OccupiedSpace === false) {
				if (snake.x === position.x && snake.y === position.y) {
					OccupiedSpace = true
					continue
				}
			}
			for (index = 0; index < snake.tail.length; index++) {
				if (snake.tail[index].x === position.x && snake.tail[index].y === position.y) {
					OccupiedSpace = true
					break
				}
			}
		}
		this.x = position.x
		this.y = position.y
	} else {
		this.noSpace = true
		UpdateText()
	}

	this.draw = () => {
		ctx.fillStyle = '#DC143C'
		ctx.fillRect(this.x, this.y, scale, scale)
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
	}
	ctx.font = scale + 'px Arial'
	ctx.fillStyle = '#ffffff'
	const scoreText = 'Score: ' + snake.tail.length
	const highScoreText = 'High score: ' + highscore
	const gridSizeText = 'Grid size: ' + gridSize.x + ", " + gridSize.y
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
		if (vectorToChange === 'x') {
			vectorToChange = 'y'
		} else {
			vectorToChange = 'x'
		}
		return
	} else if (event.key === 'w' || event.key === 'ArrowUp') {
		directionKey = 'ArrowUp'
	} else if (event.key === 'a' || event.key === 'ArrowLeft') {
		directionKey = 'ArrowLeft'
	} else if (event.key === 's' || event.key === 'ArrowDown') {
		directionKey = 'ArrowDown'
	} else if (event.key === 'd' || event.key === 'ArrowRight') {
		directionKey = 'ArrowRight'
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

addEventListener('resize', () => {resize()})

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