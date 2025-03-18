import BlockChangeEvent from "src/events/block-change-event";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import Entity from "src/utils/ecs/entity";
import { Modification } from "./history-manager";
import TilemapComponent from "src/map/tilemap-component";
import { MapEditorApi } from "../map-editor";

export class MapUpdateEvent implements Modification{
    actionName: string = "Изменение карты"
    map: Entity

    oldWidth: number
    oldHeight: number
    oldBlocks: string

    newWidth: number
    newHeight: number
    newBlocks: string

    constructor(map: Entity) {
        this.map = map
    }

    saveOldState() {
        let map = this.map.getComponent(TilemapComponent)
        this.oldWidth = map.width
        this.oldHeight = map.height
        this.oldBlocks = map.getBlocksString()
    }

    saveNewState() {
        let map = this.map.getComponent(TilemapComponent)
        this.newWidth = map.width
        this.newHeight = map.height
        this.newBlocks = map.getBlocksString()
    }

    perform() {
        let map = this.map.getComponent(TilemapComponent)
        map.setMap(this.newWidth, this.newHeight, this.newBlocks)
    }

    revert() {
        let map = this.map.getComponent(TilemapComponent)
        map.setMap(this.oldWidth, this.oldHeight, this.oldBlocks)
    }
}

type MapModification = BlockChangeEvent | MapUpdateEvent

export default class TilemapModificationWatcher {

    eventHandler = new BasicEventHandlerSet()
    changes: MapModification[] = []
    editor: MapEditorApi
    map: Entity

    constructor() {
        this.eventHandler.on("block-change", (event) => this.onBlockChange(event))
        this.eventHandler.on("will-update", () => this.onWillUpdate())
        this.eventHandler.on("update", () => this.onUpdate())
    }

    perform(map: Entity, callback: () => void) {
        this.listen(map)
        callback()
        this.listen(null)
    }

    listen(map: Entity) {
        this.map = map
        this.eventHandler.setTarget(map)
        return this
    }

    private static perform(modifications: MapModification[]) {
        for(let modification of modifications) {
            if(modification instanceof BlockChangeEvent) {
                let event = modification as BlockChangeEvent
                event.map.getComponent(TilemapComponent).setBlock(event.x, event.y, event.newBlock)
            }

            if(modification instanceof MapUpdateEvent) {
                modification.perform()
            }
        }
    }

    private static revert(modifications: MapModification[]) {
        for(let modification of modifications) {
            if(modification instanceof BlockChangeEvent) {
                let event = modification as BlockChangeEvent
                event.map.getComponent(TilemapComponent).setBlock(event.x, event.y, event.oldBlock)
            }

            if(modification instanceof MapUpdateEvent) {
                modification.revert()
            }   
        }
    }

    getModification(name: string, map: Entity, editor: MapEditorApi): Modification {
        let changes = this.changes
        return {
            actionName: name,
            perform: () => {
                TilemapModificationWatcher.perform(changes)
                editor.selectEntities([map])
                editor.setNeedsRedraw()
            },
            revert: () => {
                TilemapModificationWatcher.revert(changes)
                editor.selectEntities([map])
                editor.setNeedsRedraw()
            }
        }
    }

    onWillUpdate() {
        let event = new MapUpdateEvent(this.map)
        event.saveOldState()
        this.changes.push(event)
    }

    onUpdate() {
        let event = this.changes[this.changes.length - 1]
        if(event instanceof MapUpdateEvent) {
            event.saveNewState()
        } else {
            throw new Error("TilemapModificationWatcher received onUpdate not strictly after onWillUpdate")
        }
    }

    onBlockChange(event: BlockChangeEvent) {
        this.changes.push(event.clone())
    }
}