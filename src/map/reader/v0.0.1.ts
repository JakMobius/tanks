import { manufactureEntity, PrefabFilter } from "src/entity/components/inspector/entity-serializer"
import { MapFile } from "../map-serialization"
import GroupPrefab from "src/entity/types/group/server-prefab";
import TilemapPrefab from "src/entity/types/tilemap/server-prefab";
import SpawnzonePrefab from "src/entity/types/spawn-zone/server-prefab";
import BlockState from "../block-state/block-state";
import TilemapComponent, { charToId } from "../tilemap-component";
import Entity from "src/utils/ecs/entity";
import TransformComponent from "src/entity/components/transform/transform-component";
import SpawnzoneComponent from "src/entity/types/spawn-zone/spawnzone-component";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import GameSpawnzonesComponent from "src/server/room/game-modes/game-spawnzones-component";
import { EntityEditorTreeNodeComponent } from "src/client/ui/scene-tree-view/components";
import TeamColor from "src/utils/team-color";

export interface SpawnZoneConfig {
    id: number
    x1: number
    y1: number
    x2: number
    y2: number
}

export interface MapFileV0_0_1 extends MapFile { 
    width: number,
    height: number,
    spawnZones: SpawnZoneConfig[],
    blocks: string
}

export function readMapV0_0_1(file: MapFileV0_0_1) {
    let config = file as MapFileV0_0_1

    let name = config.name ?? null

    const createEntity = (factory?: PrefabFilter) => {
        let entity = manufactureEntity(GroupPrefab, factory?.root)
        if(!entity) return null

        let width = config.width
        let height = config.height
        let blocks: BlockState[] = Array(width * height)

        let blockCount = width * height
        for(let i = 0; i < blockCount; i++) {
            let id = charToId(config.blocks[i])
            let Block = BlockState.getBlockStateClass(id)

            // Invert the y-axis, since v0.0.1 used different Y direction
            let x = Math.floor(i % width)
            let y = Math.floor(i / width)
            y = height - y - 1
            blocks[y * width + x] = new Block()
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

            let {x1, x2, y1, y2} = spawnZone

            // Invert the y-axis, since v0.0.1 used different Y direction
            y1 = height - y1
            y2 = height - y2

            // Shift the center of the zone, since maps have their origin at the center now
            x1 -= width / 2
            x2 -= width / 2
            y1 -= height / 2
            y2 -= height / 2

            let centerX = (x1 + x2) / 2
            let centerY = (y1 + y2) / 2

            let scaleX = Math.abs(x1 - x2) / 2
            let scaleY = Math.abs(y1 - y2) / 2

            let angleTowardsCenter = Math.atan2((centerY - mapCenterY), centerX - mapCenterX) + Math.PI

            tilemap?.appendChild(zone)
            spawnzones.push(zone)

            zone.getComponent(TransformComponent).set({
                position: { x: centerX, y: centerY },
                scale: { x: scaleX, y: scaleY }
            })

            zone.getComponent(SpawnzoneComponent)
                .setTeam(spawnZone.id)
                .setSpawnAngle(angleTowardsCenter)

            zone.getComponent(EntityEditorTreeNodeComponent)
                ?.setName("Зона спавна " + TeamColor.teamNames[spawnZone.id])
        }

        let controllerGroup = manufactureEntity(GroupPrefab, factory?.leaf)
        entity.appendChild(controllerGroup)
        controllerGroup.getComponent(EntityEditorTreeNodeComponent)?.setName("Игровые режимы")

        for(let controllerPrefab of ServerEntityPrefabs.gameModes) {
            if(controllerPrefab.metadata.supportsOldMapFormat === false) continue

            const controller = manufactureEntity(controllerPrefab, factory?.leaf)
            if(controller) {
                controller.getComponent(GameSpawnzonesComponent).spawnzones = spawnzones.slice()
                controllerGroup.appendChild(controller)
            }
        }

        return entity
    }

    return { name, createEntity }
}