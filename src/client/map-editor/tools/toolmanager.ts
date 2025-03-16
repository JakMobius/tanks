
import Tool from '../tools/tool';
import KeyboardController from "src/client/controls/input/keyboard/keyboard-controller";
import BlockState from "src/map/block-state/block-state";
import Entity from "src/utils/ecs/entity";
import EventEmitter from "src/utils/event-emitter";

export default class ToolManager extends EventEmitter {
    keyboard: KeyboardController = null
    selectedTool: Tool = null
    selectedServerEntities: Entity[] = []
    selectedBlock: BlockState = null
    clientRoot: Entity
    clientCameraEntity: Entity
    serverRoot: Entity
    defaultTool: Tool = null

    constructor() {
        super()
        this.selectedTool = null
        this.selectedBlock = null
    }

    setDefaultTool(tool: Tool) {
        this.defaultTool = tool
        if(!this.selectedTool) {
            this.selectTool(tool)
        }
        return this
    }

    setClientRoot(entity: Entity) {
        this.clientRoot = entity
        return this
    }

    setServerRoot(entity: Entity) {
        this.serverRoot = entity
        return this
    }

    setClientCameraEntity(entity: Entity) {
        this.clientCameraEntity = entity
        return this
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
        this.emit("cursor", this.getCursor())
    }

    createEvent(name: string) {
        this.emit("user-event", name)
    }

    setWorldAlive(alive: boolean) {
        this.emit("world-alive", alive)
    }

    getOnlySelectedEntity() {
        return this.selectedServerEntities.length === 1 ? this.selectedServerEntities[0] : null
    }

    // Can be called from anywhere to select entities, forwards the request
    // to the map editor context
    selectEntities(entities: Entity[]) {
        this.emit("select-entities", entities)
    }

    // Should only be called from outside the map editor context to confirm
    // the selection of entities, thus maintaining single source-of-truth
    setSelectedEntities(entities: Entity[]) {
        this.selectedServerEntities = entities
        if(!this.selectedTool?.isSuitable()) {
            this.selectTool(this.defaultTool)
        }
    }
}