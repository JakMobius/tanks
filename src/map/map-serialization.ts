import Version from "src/utils/version"
import BlockState from "./block-state/block-state"
import { SpawnZone } from "./spawnzones-component"
import { serverGameWorldEntityPrefab } from "src/server/entity/server-game-world"
import Entity from "src/utils/ecs/entity"
import { EntityType } from "src/entity/entity-type"
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import TilemapComponent from "./tilemap-component"
import ServerDMControllerComponent from "src/entity/types/controller-dm/server-side/server-dm-controller-component"
import { PropertyInspector, SerializedEntityProperties } from "src/entity/components/inspector/property-inspector"
import e from "express"

export interface SpawnZoneConfig {
    id: number
    x1: number
    y1: number
    x2: number
    y2: number
}

export interface MapFile {
    signature: "TNKS",
    version: string,
    name: string,
}

export interface MapFileV0_0_1 extends MapFile { 
    width: number,
    height: number,
    spawnZones: SpawnZoneConfig[],
    blocks: string
}

export interface MapFileV0_1_0 extends MapFile {
    root: SerializedEntity
}

export interface SerializedEntity extends SerializedEntityProperties {
    children: SerializedEntity[]
}

export class MalformedMapFileError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MalformedMapFileError";
    }
}

export function idToChar(id: number) {
    if(id > 26) throw new Error("ID is too large!")
    if(id === 0) return '-'
    return String.fromCharCode('a'.charCodeAt(0) + id - 1)
}

export function charToId(char: string) {
    if(char === '-') return 0
    return char.charCodeAt(0) - 'a'.charCodeAt(0) + 1
}

export function readEntityFile(file: MapFile) {
    if(file.signature !== "TNKS") {
        throw new MalformedMapFileError("Invalid map file signature")
    }
    
    let version = new Version(file.version)
    
    if(version.compare(new Version("0.0.1")) === 0) {
        let config = file as MapFileV0_0_1

        let name = config.name ?? null

        const createEntity = () => {
            let entity = new Entity()
            ServerEntityPrefabs.types.get(EntityType.GROUP)(entity)

            let width = config.width
            let height = config.height
            let blocks: BlockState[] = []

            let blockCount = width * height
            for(let i = 0; i < blockCount; i++) {
                let id = charToId(config.blocks[i])
                let Block = BlockState.getBlockStateClass(id)
                blocks.push(new Block())
            }

            let spawnZones: SpawnZone[] = []
            for(let spawnZone of config.spawnZones) {
                let zone = new SpawnZone(spawnZone.id)
                zone.setFrom(spawnZone.x1, spawnZone.y1)
                zone.setTo(spawnZone.x2, spawnZone.y2)
                spawnZones.push(zone)
            }

            const tilemap = new Entity()
            ServerEntityPrefabs.types.get(EntityType.TILEMAP)(tilemap)
            tilemap.getComponent(TilemapComponent).setMap(width, height, blocks)
            entity.appendChild(tilemap)

            const dmController = new Entity()
            ServerEntityPrefabs.types.get(EntityType.DM_GAME_MODE_CONTROLLER_ENTITY)(dmController)
            dmController.getComponent(ServerDMControllerComponent).config.spawnZones = spawnZones
            entity.appendChild(dmController)

            return entity
        }

        return { name, createEntity }
    }

    if(version.compare(new Version("0.1.0")) === 0) {
        let config = file as MapFileV0_1_0
        let name = config.name ?? null
    
        return { name, createEntity: () => deserializeEntity(config.root) }
    }

    throw new MalformedMapFileError("Unsupported map file version: " + file.version)
}

export function writeEntityFile(entity: Entity, name: string): MapFileV0_1_0 {
    return {
        signature: "TNKS",
        version: "0.1.0",
        name,
        root: serializeEntity(entity)
    }
}

export function deserializeEntity(serialized: SerializedEntity): Entity {
    let entity = PropertyInspector.deserialize(serialized)
    
    for(let child of serialized.children) {
        entity.appendChild(deserializeEntity(child))
    }

    return entity
}

export function serializeEntity(entity: Entity): SerializedEntity {
    let inspector = new PropertyInspector(entity)
    let serialized = inspector.serialize()
    inspector.cleanup()
    let children = entity.children.map(entity => serializeEntity(entity))

    return  {
        ...serialized,
        children
    }
}