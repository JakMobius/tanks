
class Rectangle {

    x1 = null
    y1 = null
    x2 = null
    y2 = null
    minX = null
    maxX = null
    minY = null
    maxY = null

    constructor(x1?, y1?, x2?, y2?) {
        if (arguments.length === 4) {
            this.x1 = x1
            this.x2 = x2
            this.y1 = y1
            this.y2 = y2
            this.refreshBounds()
        }
    }

    isValid() {
        return Number.isFinite(this.x1) && Number.isFinite(this.x2) && Number.isFinite(this.y1) && Number.isFinite(this.y2)
    }

    contains(x, y) {
        return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY
    }

    centerX() {
        return (this.x1 + this.x2) / 2
    }

    centerY() {
        return (this.y1 + this.y2) / 2
    }

    width() {
        return this.maxX - this.minX
    }

    height() {
        return this.maxY - this.minY
    }

    invalidate() {
        this.x1 = null
        this.x2 = null
        this.y1 = null
        this.y2 = null
        this.minX = null
        this.maxX = null
        this.minY = null
        this.maxY = null
    }

    refreshBounds() {
        this.minX = Math.min(this.x1, this.x2)
        this.maxX = Math.max(this.x1, this.x2)
        this.minY = Math.min(this.y1, this.y2)
        this.maxY = Math.max(this.y1, this.y2)
    }

    translate(dx, dy) {
        this.x1 += dx
        this.x2 += dx
        this.y1 += dy
        this.y2 += dy

        this.refreshBounds()
    }

    setFrom(x, y) {
        this.x1 = x
        this.y1 = y

        this.refreshBounds()
    }

    setTo(x, y) {
        this.x2 = x
        this.y2 = y

        this.refreshBounds()
    }

    equals(rect) {
        return rect.x1 === this.x1 && rect.x2 === this.x2 && rect.y1 === this.y1 && rect.y2 === this.y2
    }

    clone() {
        return new Rectangle(this.x1, this.y1, this.x2, this.y2)
    }

    bounding(x1, y1, x2, y2) {
        if(this.x1 > x1) x1 = this.x1
        if(this.x2 < x2) x2 = this.x2
        if(this.y1 > y1) y1 = this.y1
        if(this.y2 < y2) y2 = this.y2

        return new Rectangle(x1, y1, x2, y2)
    }
}

export default Rectangle;