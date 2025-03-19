import Entity from "src/utils/ecs/entity"
import EmbeddedServerGame from "../embedded-server/embedded-server-game"
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component"
import { mapEditorEntityFactory, mapEditorPrefabFilter } from "./editor-entity-factory"
import WorldDataPacket from "src/networking/packets/game-packets/world-data-packet"
import { EntityEditorTreeRootComponent } from "../ui/scene-tree-view/components"
import WriteBuffer from "src/serialization/binary/write-buffer"
import PlayerPrefab from "src/entity/types/player/server-prefab";
import GroupPrefab from "src/entity/types/group/server-prefab";
import PlayerConnectionManagerComponent from "src/entity/types/player/server-side/player-connection-manager-component"
import PlayerWorldComponent from "src/entity/types/player/server-side/player-world-component"
import { writeEntityFile } from "src/map/map-serialization"
import FileSaver from "file-saver"
import { readMapFromDialog } from "./read-map-from-file"
import { useEffect } from "react"
import React from "react"
import EventEmitter from "src/utils/event-emitter"
import CopyManager from "./copy-manager"
import HistoryManager, { Modification } from "./history/history-manager"
import { TreeDeletionModification, TreeInsertionModification } from "./history/tree-modification"

export class MapEditorApi extends EventEmitter {
    private clientCameraEntity: Entity | null = null
    private selectedServerEntities: Entity[] = []
    private serverMapEntity: Entity | null = null
    private mapName: string | null = null
    private game = new EmbeddedServerGame()
    private copyManager = new CopyManager()
    private historyManager = new HistoryManager()

    constructor() {
        super()

        this.game.clientWorld.getComponent(EntityDataReceiveComponent).makeRoot(mapEditorEntityFactory)
        this.game.serverWorld.addComponent(new EntityEditorTreeRootComponent())

        this.game.clientConnection.on(WorldDataPacket, (packet) => {
            this.game.clientWorld.getComponent(EntityDataReceiveComponent).receivePacket(packet)
        })

        this.game.clientWorld.on("response", (buffer: WriteBuffer) => {
            new WorldDataPacket(buffer.buffer).sendTo(this.game.clientConnection.connection)
        })

        this.game.serverWorld.on("request-focus", (entity) => {
            this.selectEntities([entity])
        })

        this.game.serverWorld.on("client-connect", (client) => {
            const player = new Entity()

            PlayerPrefab.prefab(player)
            player.getComponent(PlayerConnectionManagerComponent).setClient(client)
            player.getComponent(PlayerWorldComponent).connectToWorld(this.game.serverWorld)
        })

        this.game.connectClientToServer()
    }

    setNeedsRedraw() {
        this.emit("redraw")
    }

    setMapName(name: string) {
        name = name || "Без названия"
        this.mapName = name
        this.emit("map-name-change")
    }

    setClientCameraEntity(entity: Entity) {
        this.clientCameraEntity = entity
    }

    selectEntities(entities: Entity[]) {     
        for(let oldEntity of this.selectedServerEntities) oldEntity.emit("editor-blur")
        for(let newEntity of entities) newEntity.emit("editor-focus")
        this.selectedServerEntities = entities
        this.emit("selection-change")

        this.setNeedsRedraw()
    }

    deselectEntities(entities: Entity[]) {
        let currentSelection = new Set(this.selectedServerEntities)
        
        for(let entity of entities) {
            currentSelection.delete(entity)
        }

        this.selectEntities(Array.from(currentSelection))
    }

    loadMap(name: string, entity: Entity) {
        this.selectEntities([])
        this.copyManager.clearCache()
        this.historyManager.clear()
        this.serverMapEntity?.removeFromParent()
        this.game.serverWorld.appendChild(entity)
        this.serverMapEntity = entity
        this.emit("map-change")
        this.setMapName(name)
        this.setNeedsRedraw()
    }

    saveMap() {
        let name = this.mapName ?? "Новая карта"
        let serialized = writeEntityFile(this.serverMapEntity, this.mapName)
        let blob = new Blob([JSON.stringify(serialized)], {type: "application/json;charset=utf-8"});

        FileSaver.saveAs(blob, name + ".json")
    }

    openMap() {
        return readMapFromDialog().then((packedEntity) => {
            this.loadMap(packedEntity.name, packedEntity.createEntity(mapEditorPrefabFilter))
        })
    }

    selectAll() {
        let allEntities: Entity[] = []
        const collectEntities = (entity: Entity) => {
            allEntities.push(entity)
            for(let child of entity.children) collectEntities(child)
        }
        collectEntities(this.serverMapEntity)
        this.selectEntities(allEntities)
    }

    deleteSelection() {
        let modification = new TreeDeletionModification("Удаление", this, this.selectedServerEntities)
        modification.perform()
        this.historyManager.registerModification(modification)
    }

    copy() {
        this.copyManager.copy(this.selectedServerEntities)
    }

    paste() {
        let selectedEntity = this.selectedServerEntities[0] ?? this.serverMapEntity
        
        this.copyManager.paste(mapEditorPrefabFilter).then((entities) => {
            for(let newEntity of entities) {
                selectedEntity.appendChild(newEntity)
            }
            
            let modification = new TreeInsertionModification("Вставка", this, entities)
            this.historyManager.registerModification(modification)
            this.selectEntities(entities)
        })
    }

    undo() {
        this.historyManager.goBack()
        this.setNeedsRedraw()
    }

    redo() {
        this.historyManager.goForward()
        this.setNeedsRedraw()
    }
    
    newMap() {
        const rootGroup = new Entity()
        GroupPrefab.prefab(rootGroup)

        this.loadMap("Новая карта", rootGroup)
    }

    getClientWorld() {
        return this.game.clientWorld
    }

    getServerWorld() {
        return this.game.serverWorld
    }

    getClientCameraEntity() {
        return this.clientCameraEntity
    }

    getSelectedEntities() {
        return this.selectedServerEntities
    }

    getServerMapEntity() {
        return this.serverMapEntity
    }

    getMapName() {
        return this.mapName
    }

    getHistoryManager() {
        return this.historyManager
    }

    getGame() {
        return this.game
    }

    useEvent(event: string, callback: () => void) {
        useEffect(() => {
            this.on(event, callback)
            return () => { this.off(event, callback) }
        }, [])
    }

    useMapName() {
        let [mapName, setMapName] = React.useState(this.getMapName())
        this.useEvent("map-name-change", () => setMapName(this.getMapName()))
        return mapName
    }

    useSelectedEntities() {
        let [selectedEntities, setSelectedEntities] = React.useState(this.getSelectedEntities())
        this.useEvent("selection-change", () => setSelectedEntities(this.getSelectedEntities()))
        return selectedEntities
    }

    useMap() {
        let [map, setMap] = React.useState(this.getServerMapEntity())
        this.useEvent("map-change", () => setMap(this.getServerMapEntity()))
        return map
    }

    useClientCameraEntity() {
        let [camera, setCamera] = React.useState(this.getClientCameraEntity())
        this.useEvent("camera-change", () => setCamera(this.getClientCameraEntity()))
        return camera
    }
}