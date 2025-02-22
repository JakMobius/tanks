
import Rectangle from '../utils/rectangle';
import { Component } from 'src/utils/ecs/component';
import Entity from 'src/utils/ecs/entity';
import TilemapComponent from './tilemap-component';

export class SpawnZone extends Rectangle {
	public id: number;

    constructor(id: number) {
        super()
        this.id = id
    }
}

export default class SpawnzonesComponent implements Component {
    spawnZones: SpawnZone[]
    entity: Entity

    constructor(spawnZones?: SpawnZone[]) {
        this.spawnZones = spawnZones ?? []
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

    spawnPointForTeam(id: number) {
        let tilemap = this.entity.getComponent(TilemapComponent)
        const zone = this.spawnZones[id];

        if(!zone) {
            return {
                x: Math.random() * tilemap.width * TilemapComponent.BLOCK_SIZE,
                y: Math.random() * tilemap.height * TilemapComponent.BLOCK_SIZE
            }
        }

        const x = (Math.random() * (zone.x2 - zone.x1) + zone.x1) * TilemapComponent.BLOCK_SIZE;
        const y = (Math.random() * (zone.y2 - zone.y1) + zone.y1) * TilemapComponent.BLOCK_SIZE;

        return {x: x, y: y}
    }
}