
import DocumentEventHandler from '../../controls/interact/documenteventhandler';
import Camera from '../../camera';
import Screen from '../../screen';
import Tool from '../tools/tool';

class ToolManager extends DocumentEventHandler {

    /**
     * @type Camera
     */
    camera = null

    /**
     * @type {HTMLCanvasElement}
     */
    canvas = null

    /**
     * @type {KeyboardController}
     */
    keyboard = null

    /**
     * @type {Tool}
     */
    selectedTool = null

    /**
     * @type {EditorMap}
     */
    map = null

    /**
     * @type Screen
     */
    screen = null

    /**
     * @type {BlockState}
     */
    selectedBlock = null

    /**
     * @param screen {Screen}
     * @param camera {Camera}
     * @param map {EditorMap}
     */

    constructor(screen, camera, map) {
        super()
        this.screen = screen
        this.camera = camera
        this.map = map
        this.selectedTool = null
        this.selectedBlock = null

        this.target = this.screen.canvas
        this.startListening()
    }

    setNeedsRedraw(force) {
        this.emit("redraw", force)
    }

    startListening() {
        this.bind("mousedown", this.mouseDown)
        this.bind("mouseup", this.mouseUp)
        this.bind("mousemove", this.mouseMove)
    }

    mouseDown(event) {
        event.preventDefault()

        if(this.selectedTool && event.which === 1) {
            let x = event.pageX / this.screen.width * 2 - 1
            let y = -(event.pageY / this.screen.height * 2 - 1)
            this.camera.matrix.save()
            this.camera.matrix.inverse()
            this.selectedTool.mouseDown(
                this.camera.matrix.transformX(x, y),
                this.camera.matrix.transformY(x, y)
            )
            this.camera.matrix.restore()
        }
    }

    mouseUp(event) {
        event.preventDefault()
        if(this.selectedTool) {
            this.selectedTool.mouseUp()
        }
    }

    mouseMove(event) {
        event.preventDefault()

        if(this.selectedTool) {
            let x = event.pageX / this.screen.width * 2 - 1
            let y = -(event.pageY / this.screen.height * 2 - 1)
            this.camera.matrix.save()
            this.camera.matrix.inverse()
            this.selectedTool.mouseMove(
                this.camera.matrix.transformX(x, y),
                this.camera.matrix.transformY(x, y)
            )
            this.camera.matrix.restore()
        }
    }

    selectTool(tool) {
        if(this.selectedTool) {
            this.selectedTool.resignActive()
        }

        this.selectedTool = tool

        if(this.selectedTool) {
            this.selectedTool.becomeActive()
            this.updateCursor()
        }
    }

    selectBlock(block) {
        this.selectedBlock = block
    }

    getCursor() {
        if(this.selectedTool && this.selectedTool.cursor) {
            return this.selectedTool.cursor
        } else {
            return "default"
        }
    }

    updateCursor() {
        this.screen.canvas.style.cursor = this.getCursor()
    }

    createEvent(name) {
        this.emit("event", name)
    }
}

export default ToolManager;