const canvas = document.createElement("CANVAS")
const ctx = canvas.getContext('2d')

let scale = 20

//artificial framerate, every 6th frame movement occurs
//framerate depends on refresh rate of monitor
const waitframes = 6
let frameswaited = 0
let startCooldown = 0

document.body.appendChild(canvas)
canvas.width = innerWidth
canvas.height = innerHeight
canvas.style.display = "block" // gets rid of scrollbars
ctx.fillStyle = '#000000'
ctx.fillRect(0, 0, innerWidth, innerHeight)
ctx.clearRect(scale, scale, 16 * scale, 16 * scale)

/*
TODO:

-Create new var gridSize, has x and y
-Add food
-Add gameover for touching own tail
-Add buffer to moving & unable to intentionally crash into self
-Fix the artifical framerate (use realtime) https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe

*/

function Snake() {
	this.x = scale
	this.y = scale
	this.xspeed = 1 * scale
	this.yspeed = 0 * scale
	this.tail = []
	
	this.direction = (x, y) => {
		this.xspeed = x * scale
		this.yspeed = y * scale
		if (startCooldown > 0) {
			startCooldown = 0
		}
	}
	
	this.update = () => {
		this.x += this.xspeed
		this.y += this.yspeed
		if (this.x > 16 * scale || this.x < scale || this.y > 16 * scale || this.y < scale) {
			startGame()
		}
	}
	
	this.draw = () => {
		ctx.fillStyle = '#228B22'
		//fill through tail
		ctx.fillRect(this.x, this.y, scale, scale)
	}
}

const snake = new Snake()

function animate() {
	requestAnimationFrame(animate)
	
	//artificial framerate
	if (startCooldown > 0) {
		startCooldown -= 1
	} else {
		if (frameswaited === waitframes) {
			ctx.clearRect(scale, scale, 16 * scale, 16 * scale)
			snake.update()
			snake.draw()
			frameswaited = 0
		} else {
			frameswaited += 1
		}
	}
}

function startGame() {
	startCooldown = 60
	snake.tail = []
	snake.x = Math.floor(Math.random() * 16) * scale + scale
	snake.y = Math.floor(Math.random() * 16) * scale + scale
	snake.xspeed = 1 * scale
	snake.yspeed = 0 * scale
	// Random new snake location, reset speed
	// Create new food
}

addEventListener('keydown', (event) => {
	if (event.key === 'ArrowUp') {
		snake.direction(0, -1)
	} else if (event.key === 'ArrowDown') {
		snake.direction(0, 1)
	} else if (event.key === 'ArrowRight') {
		snake.direction(1, 0)
	} else if (event.key === 'ArrowLeft') {
		snake.direction(-1, 0)
	}
})

addEventListener('resize', () => {
	canvas.width = innerWidth
	canvas.height = innerHeight
})

animate()