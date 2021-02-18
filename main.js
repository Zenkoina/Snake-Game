const canvas = document.createElement("CANVAS")
const ctx = canvas.getContext('2d')

let scale = 20

//artificial framerate, every 6th frame movement occurs
const waitframes = 5
let frameswaited = 0

document.body.appendChild(canvas)
canvas.width = innerWidth
canvas.height = innerHeight
canvas.style.display = "block" // gets rid of scrollbars
canvas.style.background = 'DarkSlateGray'

function Snake() {
	this.x = 20
	this.y = 20
	this.xspeed = 1 * scale
	this.yspeed = 0 * scale
	this.tail = []
	
	this.direction = (x, y) => {
		this.xspeed = x * scale
		this.yspeed = y * scale
	}
	
	this.update = () => {
		if (this.x > innerWidth - scale || this.x < 0 || this.y > innerHeight - scale || this.y < 0) {
			startGame()
		} else {
			this.x += this.xspeed
			this.y += this.yspeed
		}
	}
	
	this.draw = () => {
		//fill through tail
		ctx.fillRect(this.x, this.y, scale, scale)
	}
}

const snake = new Snake()

function animate() {
	requestAnimationFrame(animate)
	
	//artificial framerate
	if (frameswaited === waitframes) {
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		snake.update()
		snake.draw()
		frameswaited = 0
	} else {
		frameswaited += 1
	}
}

function startGame() {
	snake.tail = []
	snake.x = 20
	snake.y = 20
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