
import Tool from '../tools/tool';
import KeyboardController from "src/client/controls/input/keyboard/keyboard-controller";
import BlockState from "src/map/block-state/block-state";
import Entity from "src/utils/ecs/entity";
import EventEmitter from "src/utils/event-emitter";

export default class ToolManager extends EventEmitter {
    keyboard: KeyboardController = null
    selectedTool: Tool = null
    world: Entity = null
    selectedBlock: BlockState = null

    constructor(world: Entity) {
        super()
        this.world = world
        this.selectedTool = null
        this.selectedBlock = null
    }

    setNeedsRedraw() {
        this.emit("redraw")
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

        this.emit("select-tool", tool)
    }

    selectBlock(block: BlockState) {
        this.selectedBlock = block
        this.emit("select-block", block)
    }

    getCursor() {
        if(this.selectedTool && this.selectedTool.cursor) {
            return this.selectedTool.cursor
        } else {
            return "default"
        }
    }

    updateCursor() {
        // this.screen.canvas.style.cursor = this.getCursor()
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

    mouseDown(x: number, y: number) {
        if(this.selectedTool) {
            this.selectedTool.mouseDown(x, y)
        }
    }

    mouseUp(x: number, y: number) {
        if(this.selectedTool) {
            this.selectedTool.mouseUp(x, y)
        }
    }

    mouseMove(x: number, y: number) {
        if(this.selectedTool) {
            this.selectedTool.mouseMove(x, y)
        }
    }

}