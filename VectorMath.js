class CreateVector {
    constructor(x, y) {
        this.x = x || 0
        this.y = y || 0
    }

    add(Vector) {
        this.x += Vector.x
        this.y += Vector.y
        return this
    }

    sub(Vector) {
        this.x -= Vector.x
        this.y -= Vector.y
        return this
    }

    mult(num) {
        this.x *= num
        this.y *= num
        return this
    }

    div(num) {
        this.x /= num
        this.y /= num
        return this
    }

    normalize() {
        const len = this.mag()
        if (len !== 0) {
            this.mult(1 / len)
            return this
        }
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    setMag(num) {
        this.normalize().mult(num)
        return this
    }

    randomize() {
        let angle = Math.random() * Math.PI * 2
        this.x = Math.cos(angle)
        this.y = Math.sin(angle)
        return this
    }
}