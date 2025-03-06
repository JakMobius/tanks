
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

    sample() {
        const x = (Math.random() * (this.x2 - this.x1) + this.x1) * TilemapComponent.BLOCK_SIZE;
        const y = (Math.random() * (this.y2 - this.y1) + this.y1) * TilemapComponent.BLOCK_SIZE;

        return {x: x, y: y}
    }
}