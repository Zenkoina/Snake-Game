const canvas = document.createElement("CANVAS")
const ctx = canvas.getContext('2d')

let scale = 20

//artificial framerate, every 6th frame movement occurs
//framerate depends on refresh rate of monitor
const waitframes = 6
let frameswaited = 0

let startCooldown = 0
let snake
let food

document.body.appendChild(canvas)
canvas.width = innerWidth
canvas.height = innerHeight
canvas.style.display = "block" // gets rid of scrollbars
ctx.fillStyle = '#000000'
ctx.fillRect(0, 0, innerWidth, innerHeight)

/*
TODO:

-Add food functionality including tail
-Add gameover for touching own tail
-Add buffer to moving & unable to intentionally crash into self
-Add score counter
-Fix the artifical framerate (use realtime) https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
-Create new var gridSize, has x and y
-Scaling canvas to window size (ctx.scale())

*/

function Snake() {
	this.x = Math.floor(Math.random() * 16) * scale + scale
	this.y = Math.floor(Math.random() * 16) * scale + scale
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
		if (this.x > scale * 16 || this.x < scale || this.y > scale * 16 || this.y < scale) {
			startGame()
		}
		if (this.x === food.x && this.y === food.y) {
			food = new Food()
		}
	}
	
	this.draw = () => {
		ctx.fillStyle = '#228B22'
		//add fill through tail
		ctx.fillRect(this.x, this.y, scale, scale)
	}
}

function Food() {
	//Edit to check if snake is on random spot
	this.x = Math.floor(Math.random() * 16) * scale + scale
	this.y = Math.floor(Math.random() * 16) * scale + scale

	this.draw = () => {
		ctx.fillStyle = '#DC143C'
		ctx.fillRect(this.x, this.y, scale, scale)
	}
}

function animate() {
	requestAnimationFrame(animate)
	
	if (startCooldown > 0) {
		startCooldown -= 1
	} else {
		if (frameswaited === waitframes) {
			ctx.clearRect(scale, scale, 16 * scale, 16 * scale)
			food.draw()
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
	snake = new Snake()
	food = new Food()
	ctx.clearRect(scale, scale, 16 * scale, 16 * scale)
	snake.draw()
	food.draw()
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

/*
addEventListener('resize', () => {
	canvas.width = innerWidth
	canvas.height = innerHeight
})
*/

startGame()
animate()