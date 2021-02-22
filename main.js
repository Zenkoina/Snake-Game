const canvas = document.createElement("CANVAS")
const ctx = canvas.getContext('2d')

let scale = 20

//artificial framerate, every 6th frame movement occurs
//framerate depends on refresh rate of monitor
const waitframes = 5
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
	
	this.death = () => {
		if (this.x > scale * 16 || this.x < scale || this.y > scale * 16 || this.y < scale) {
			startGame()
		}
		this.tail.forEach((item) => {
			if (item.x === this.x && item.y === this.y) {
				startGame()
			}
		})
	}

	this.update = () => {
		this.x += this.xspeed
		this.y += this.yspeed
		if (this.x === food.x && this.y === food.y) {
			food = new Food()
			food.draw()
			this.tail.push(new CreateVector(this.x - this.xspeed, this.y - this.yspeed))
		} else {
			for (index = 0; index < this.tail.length - 1; index++) {
				this.tail[index] = this.tail[index + 1]
			}
			if (this.tail.length > 0) {
				this.tail[this.tail.length - 1] = new CreateVector(this.x - this.xspeed, this.y - this.yspeed)
			}
		}
		this.death()
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
			ctx.clearRect(0, 0, innerWidth, innerHeight)
			ctx.fillStyle = '#000000'
			ctx.fillRect(0, 0, innerWidth, innerHeight)
			ctx.clearRect(scale, scale, 16 * scale, 16 * scale)
			food.draw()
			snake.update()
			snake.draw()
			frameswaited = 0
			UpdateScore()
		} else {
			frameswaited += 1
		}
	}
}

function startGame() {
	startCooldown = 60
	snake = new Snake()
	food = new Food()
	ctx.clearRect(0, 0, innerWidth, innerHeight)
	ctx.fillStyle = '#000000'
	ctx.fillRect(0, 0, innerWidth, innerHeight)
	ctx.clearRect(scale, scale, 16 * scale, 16 * scale)
	snake.draw()
	food.draw()
}

function UpdateScore() {
	ctx.font = "30px Arial";
	ctx.fillStyle = '#ffffff'
	ctx.fillText('Score: ' + snake.tail.length, scale, scale * 16 + 60);
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

addEventListener('click', () => {
	console.log(snake.tail)
})

/*
addEventListener('resize', () => {
	canvas.width = innerWidth
	canvas.height = innerHeight
})
*/

startGame()
animate()