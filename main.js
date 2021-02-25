const canvas = document.createElement("CANVAS")
const ctx = canvas.getContext('2d')

let scale = 20
let gridSize = new CreateVector(15, 15)

//artificial framerate, every 6th frame movement occurs
//framerate depends on refresh rate of monitor
const waitframes = 59 //waits 5 frames for every draw, at 60 fps this results in a frame occouring every ~.100s
let frameswaited = 0

let startCooldown = 0
let snake
let food
let highscore = 0

document.body.appendChild(canvas)
canvas.width = innerWidth
canvas.height = innerHeight
canvas.style.display = "block" // gets rid of scrollbars

/*
TODO:

1. fix directionbuffer/buffermade/direction, check screenshot saved on computer

-fix food spawning inside of snake, end game if no spots left (use gridsize x*y with snake.length)
	-food has to be created after both snake + tailmovement has happened
-Add buffer to moving & unable to intentionally crash into self
-Fix the artifical framerate (use realtime) https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
-Scaling canvas to window size (ctx.scale())

*/

function Snake() {
	this.x = Math.floor(Math.random() * gridSize.x) * scale + scale
	this.y = Math.floor(Math.random() * gridSize.y) * scale + scale
	this.direction = 'ArrowRight'
	this.directionChangeCooldown = false
	this.bufferMade = true
	this.directionBuffer
	this.xspeed
	this.yspeed
	this.tail = []
	
	this.death = () => {
		if (this.x > scale * gridSize.x || this.x < scale || this.y > scale * gridSize.y || this.y < scale) {
			startGame()
		}
		this.tail.forEach((item) => {
			if (item.x === this.x && item.y === this.y) {
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
		this.x += (this.xspeed * scale)
		this.y += (this.yspeed * scale)
		if (this.x === food.x && this.y === food.y) {
			food = new Food()
			food.draw()
			this.tail.push(new CreateVector(this.x - this.xspeed * scale, this.y - this.yspeed * scale))
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
		this.tail.forEach((item, index) => {
			ctx.fillRect(item.x, item.y, scale, scale)
		})
		ctx.fillRect(this.x, this.y, scale, scale)
	}
}

function CreateVector(x, y) {
	this.x = x
	this.y = y
}


function Food() {
	//Edit to check if snake is on random spot + any available spots
	this.x = Math.floor(Math.random() * gridSize.x) * scale + scale
	this.y = Math.floor(Math.random() * gridSize.y) * scale + scale

	this.draw = () => {
		ctx.fillStyle = '#DC143C'
		ctx.fillRect(this.x, this.y, scale, scale)
	}
}

function animate() {
	requestAnimationFrame(animate)
	
	if (startCooldown > 0) {
		startCooldown -= 1
		ctx.clearRect(0, 0, innerWidth, innerHeight)
		ctx.fillStyle = '#000000'
		ctx.fillRect(0, 0, innerWidth, innerHeight)
		ctx.clearRect(scale, scale, scale * gridSize.x, scale * gridSize.y)
		food.draw()
		snake.draw()
		UpdateText()
	} else {
		if (frameswaited === waitframes) {
			ctx.clearRect(0, 0, innerWidth, innerHeight)
			ctx.fillStyle = '#000000'
			ctx.fillRect(0, 0, innerWidth, innerHeight)
			ctx.clearRect(scale, scale, scale * gridSize.x, scale * gridSize.y)
			food.draw()
			snake.update()
			snake.draw()
			frameswaited = 0
			UpdateText()
		} else {
			frameswaited += 1
		}
	}
}

function startGame() {
	startCooldown = 60
	snake = new Snake()
	food = new Food()
}

function UpdateText() {
	if (snake.tail.length > highscore) {
		highscore = snake.tail.length
	}
	ctx.font = scale + 'px Arial'
	ctx.fillStyle = '#ffffff'
	ctx.fillText('Score: ' + snake.tail.length, scale, scale * gridSize.y + scale + scale)
	ctx.fillText('High score: ' + highscore, scale, scale * gridSize.y + scale + scale * 2)
	ctx.fillText('Grid size: ' + gridSize.x + ", " + gridSize.y, scale, scale * gridSize.y + scale + scale * 3)
}

addEventListener('keydown', (event) => {
	if (event.key === 'r') {
		startGame()
	}
	if (snake.tail.length > 0) {
		if (event.key === 'ArrowUp' && snake.direction === 'ArrowDown' || event.key === 'ArrowDown' && snake.direction === 'ArrowUp' || event.key === 'ArrowRight' && snake.direction === 'ArrowLeft' || event.key === 'ArrowLeft' && snake.direction === 'ArrowRight') {
			return
		}
	}
	if (snake.bufferMade = false) {
		snake.directionChangeCooldown = true
	}
	if (snake.directionChangeCooldown === true) {
		if (event.key != snake.direction) {
			console.log('event.key is not equal to snake.direction')
			snake.directionBuffer = event.key
		}
	} else if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
		snake.direction = event.key
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
		gridSize.x -= 1
	} else {
		gridSize.y -= 1
	}
	startGame()
})

addEventListener('contextmenu', (event) => {
	event.preventDefault()
	if (vectorToChange === 'x') {
		gridSize.x += 1
	} else {
		gridSize.y += 1
	}
	startGame()
})

addEventListener('auxclick', (event) => {
	event.preventDefault()
	if (event.button === 1) {
		if (vectorToChange === 'x') {
			vectorToChange = 'y'
		} else {
			vectorToChange = 'x'
		}
	}
})

/*
addEventListener('resize', () => {
	canvas.width = innerWidth
	canvas.height = innerHeight
})
*/

startGame()
animate()