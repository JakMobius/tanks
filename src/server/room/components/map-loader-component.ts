import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import { MapFile, readEntityFile } from "src/map/map-serialization";

export default class MapLoaderComponent implements Component {
    entity: Entity | null = null
    path: string
    json: MapFile

    constructor(json: MapFile) {
        this.json = json
    }

    reloadMap() {
        // let { width, height, blocks, spawnZones } = readEntityFile(this.json)

        // this.entity.getComponent(TilemapComponent).setMap(width, height, blocks)
        // this.entity.getComponent(SpawnzonesComponent).spawnZones = spawnZones
    }

    onAttach(entity: Entity) {
        this.entity = entity
    }

    onDetach() {
        this.entity = null
    }
}
