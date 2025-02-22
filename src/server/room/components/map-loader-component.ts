import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import fs from "fs"
import TilemapComponent from "src/map/tilemap-component";
import { MapFile, readMapFile } from "src/map/map-serialization";
import SpawnzonesComponent from "src/map/spawnzones-component";

export default class MapLoaderComponent implements Component {
    entity: Entity | null = null
    path: string

    constructor(path: string) {
        this.path = path
    }

    reloadMap() {
        // TODO: async?
        let file = fs.readFileSync(this.path, "utf-8")

        // TODO: check scheme?
        let json = JSON.parse(file) as unknown as MapFile
        
        let { width, height, blocks, spawnZones } = readMapFile(json)

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
