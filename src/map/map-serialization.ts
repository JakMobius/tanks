import Version from "src/utils/version"
import BlockState from "./block-state/block-state"
import Entity from "src/utils/ecs/entity"
import TilemapComponent, { charToId } from "./tilemap-component"
import GameSpawnzonesComponent from "src/server/room/game-modes/game-spawnzones-component"
import TransformComponent from "src/entity/components/transform/transform-component"
import SpawnzoneComponent from "src/entity/types/spawn-zone/spawnzone-component"
import GroupPrefab from 'src/entity/types/group/server-prefab';
import TilemapPrefab from 'src/entity/types/tilemap/server-prefab';
import SpawnzonePrefab from 'src/entity/types/spawn-zone/server-prefab';
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import { EntityDeserializer, PrefabFilter, EntitySerializer, manufactureEntity, SerializedEntity } from "src/entity/components/inspector/entity-serializer"

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
    danglingEntities: SerializedEntity[]
}

export class MalformedMapFileError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MalformedMapFileError";
    }
}

export function readEntityFile(file: MapFile) {
    if(file.signature !== "TNKS") {
        throw new MalformedMapFileError("Invalid map file signature")
    }
    
    let version = new Version(file.version)
    
    if(version.compare(new Version("0.0.1")) === 0) {
        let config = file as MapFileV0_0_1

        let name = config.name ?? null

        const createEntity = (factory?: PrefabFilter) => {
            let entity = manufactureEntity(GroupPrefab, factory?.root)
            if(!entity) return null

            let width = config.width
            let height = config.height
            let blocks: BlockState[] = []

            let blockCount = width * height
            for(let i = 0; i < blockCount; i++) {
                let id = charToId(config.blocks[i])
                let Block = BlockState.getBlockStateClass(id)
                blocks.push(new Block())
            }

            const tilemap = manufactureEntity(TilemapPrefab, factory?.leaf)
            tilemap?.getComponent(TilemapComponent).setMap(width, height, blocks)
            if(tilemap) entity.appendChild(tilemap)

            let mapCenterX = width / 2 * TilemapComponent.DEFAULT_SCALE
            let mapCenterY = height / 2 * TilemapComponent.DEFAULT_SCALE

            let spawnzones: Entity[] = []
            for(let spawnZone of config.spawnZones) {
                let zone = manufactureEntity(SpawnzonePrefab, factory?.leaf)
                if(!zone) continue

                let centerX = (spawnZone.x1 + spawnZone.x2) / 2 * TilemapComponent.DEFAULT_SCALE
                let centerY = (spawnZone.y1 + spawnZone.y2) / 2 * TilemapComponent.DEFAULT_SCALE

                let scaleX = Math.abs(spawnZone.x1 - spawnZone.x2) / 2 * TilemapComponent.DEFAULT_SCALE
                let scaleY = Math.abs(spawnZone.y1 - spawnZone.y2) / 2 * TilemapComponent.DEFAULT_SCALE

                let angleTowardsCenter = Math.atan2(-(centerY - mapCenterY), centerX - mapCenterX) + Math.PI

                zone.getComponent(TransformComponent).set({
                    position: { x: centerX, y: centerY },
                    scale: { x: scaleX, y: scaleY }
                })
                zone.getComponent(SpawnzoneComponent)
                    .setTeam(spawnZone.id)
                    .setSpawnAngle(angleTowardsCenter)
                entity.appendChild(zone)
                spawnzones.push(zone)
            }

            for(let controllerPrefab of ServerEntityPrefabs.gameModes) {
                if(controllerPrefab.metadata.supportsOldMapFormat === false) continue

                const controller = manufactureEntity(controllerPrefab, factory?.leaf)
                if(controller) {
                    controller.getComponent(GameSpawnzonesComponent).spawnzones = spawnzones.slice()
                    entity.appendChild(controller)
                }
            }

            return entity
        }

        return { name, createEntity }
    }

    if(version.compare(new Version("0.1.0")) === 0) {
        let config = file as MapFileV0_1_0
        let name = config.name ?? null
    
        return { name, createEntity: (factory: PrefabFilter) => {
            let ctx = new EntityDeserializer(factory)

            if(config.danglingEntities) {
                for(let entity of config.danglingEntities) {
                    ctx.createTreeFor(entity, false)
                }
            }

            let entity = ctx.createTreeFor(config.root)
            ctx.restoreProperties()

            return entity
        }}
    }

    throw new MalformedMapFileError("Unsupported map file version: " + file.version)
}

export function writeEntityFile(entity: Entity, name: string): MapFileV0_1_0 {
    let serializer = new EntitySerializer()
    let root = serializer.serializeTree(entity)
    let danglingEntities = serializer.getSerializedDanglingEntities()
    return {
        signature: "TNKS",
        version: "0.1.0",
        name, root, danglingEntities
    }
}