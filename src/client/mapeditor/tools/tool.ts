

class Tool {
	public dragging: any;
	public cursor: any;
	public locksDragging: any;
	public settingsView: any;
    /**
     * Path to tool icon
     * @type {string|null}
     */
    image = null

    /**
     * Localized tool name
     * @type {string|null}
     */
    name = null

    /**
     * Tool manager associated with this tool
     * @type {ToolManager}
     */
    manager = null

    constructor(manager) {
        this.image = null
        this.manager = manager
        this.name = null
        this.dragging = false
        this.cursor = null
        this.locksDragging = true
        this.settingsView = null
    }

    setCursor(cursor) {
        this.cursor = cursor
        this.manager.updateCursor()
    }

    mouseDown(x, y) {
        this.dragging = true
    }

    mouseMove(x, y) {

    }

    mouseUp() {
        this.dragging = false
    }

    becomeActive() {

    }

    resignActive() {

    }

    drawDecorations() {

    }

    trace(x1, y1, x2, y2, callback) {
        let dx = x2 - x1
        let dy = y2 - y1

        callback(x1, y1)

        if(dx === 0 && dy === 0) {
            return
        }

        let adx = Math.abs(dx);
        let ady = Math.abs(dy);

        let sx = dx > 0
        let sy = dy > 0

        if(adx > ady) {
            dx /= adx;
            dy /= adx;
        } else {
            dx /= ady;
            dy /= ady;
        }

        let x = x1
        let y = y1

        while(true) {
            callback(Math.floor(x), Math.floor(y))
            x += dx
            y += dy
            if((dx !== 0 && x !== x2 && (x > x2) === sx) || (dy !== 0 && y !== y2 && (y > y2) === sy)) break;
        }
    }
}

export default Tool;