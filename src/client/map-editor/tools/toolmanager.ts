import DocumentEventHandler from '../../controls/interact/document-event-handler';
import Camera from '../../camera';
import Tool from '../tools/tool';
import KeyboardController from "src/client/controls/input/keyboard/keyboard-controller";
import BlockState from "src/map/block-state/block-state";
import SceneScreen from "src/client/graphics/scene-screen";
import Entity from "src/utils/ecs/entity";

export default class ToolManager extends DocumentEventHandler {

    camera: Camera = null
    canvas: HTMLCanvasElement = null
    keyboard: KeyboardController = null
    selectedTool: Tool = null
    world: Entity = null
    screen: SceneScreen = null
    selectedBlock: BlockState = null

    constructor(screen: SceneScreen, camera: Camera, world: Entity) {
        super()
        this.screen = screen
        this.camera = camera
        this.world = world
        this.selectedTool = null
        this.selectedBlock = null

        this.target = this.screen.canvas
        this.startListening()
    }

    setNeedsRedraw() {
        this.emit("redraw")
    }

    startListening() {
        this.bind("mousedown", this.mouseDown)
        this.bind("mouseup", this.mouseUp)
        this.bind("mousemove", this.mouseMove)
    }

    mouseDown(event: MouseEvent) {
        event.preventDefault()

        if(this.selectedTool && event.button === 0) {
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

    mouseUp(event: MouseEvent) {
        event.preventDefault()
        if(this.selectedTool) {
            this.selectedTool.mouseUp()
        }
    }

    mouseMove(event: MouseEvent) {
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

    selectTool(tool: Tool) {
        if(this.selectedTool) {
            this.selectedTool.resignActive()
        }

        this.selectedTool = tool

        if(this.selectedTool) {
            this.selectedTool.becomeActive()
            this.updateCursor()
        }
    }

    selectBlock(block: BlockState) {
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

    createEvent(name: string) {
        this.emit("user-event", name)
    }

    setWorldAlive(alive: boolean) {
        this.emit("world-alive", alive)
    }

    setCameraMovementEnabled(enabled: boolean) {
        this.emit("camera-movement", enabled)
    }

}