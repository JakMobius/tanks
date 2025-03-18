
import Tool from '../tools/tool';
import BlockState from "src/map/block-state/block-state";
import Entity from "src/utils/ecs/entity";
import EventEmitter from "src/utils/event-emitter";
import BasicEventHandlerSet from 'src/utils/basic-event-handler-set';
import { MapEditorApi } from '../map-editor';

export default class ToolManager extends EventEmitter {
    selectedTool: Tool = null
    selectedBlock: BlockState = null
    defaultTool: Tool = null
    editor: MapEditorApi | null = null

    editorEventHandler = new BasicEventHandlerSet()

    constructor() {
        super()
        this.selectedTool = null
        this.selectedBlock = null

        this.editorEventHandler.on("selection-change", () => {
            if(!this.selectedTool?.isSuitable()) {
                this.selectTool(this.defaultTool)
            }
            this.emit("update")
        })
    }

    setEditor(editor: MapEditorApi) {
        this.editor = editor
        this.editorEventHandler.setTarget(editor)
    }

    setNeedsRedraw() {
        this.editor?.setNeedsRedraw()
    }

    setDefaultTool(tool: Tool) {
        this.defaultTool = tool
        if(!this.selectedTool) {
            this.selectTool(tool)
        }
        return this
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
        this.emit("update")
    }

    selectBlock(block: BlockState) {
        this.selectedBlock = block
        this.emit("select-block", block)
        this.emit("update")
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

    getSelectedEntities() {
        return this.editor.getSelectedEntities()
    }

    getOnlySelectedEntity() {
        let selection = this.getSelectedEntities()
        return selection.length === 1 ? selection[0] : null
    }

    getCamera() {
        return this.editor?.getClientCameraEntity()
    }

    getClientWorld() {
        return this.editor.getClientWorld()
    }

    // Can be called from anywhere to select entities, forwards the request
    // to the map editor context
    selectEntities(entities: Entity[]) {
        this.editor.selectEntities(entities)
    }
}