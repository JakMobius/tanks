import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import TilemapComponent from "src/map/tilemap-component";
import { MapFile, readMapFile } from "src/map/map-serialization";
import SpawnzonesComponent from "src/map/spawnzones-component";

export default class MapLoaderComponent implements Component {
    entity: Entity | null = null
    path: string
    json: MapFile

    constructor(json: MapFile) {
        this.json = json
    }

    reloadMap() {
        let { width, height, blocks, spawnZones } = readMapFile(this.json)

        this.entity.getComponent(TilemapComponent).setMap(width, height, blocks)
        this.entity.getComponent(SpawnzonesComponent).spawnZones = spawnZones
    }

    onAttach(entity: Entity) {
        this.entity = entity
    }

    onDetach() {
        this.entity = null
    }
}
