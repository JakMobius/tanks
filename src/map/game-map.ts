import MapBinaryOptions from './map-binary-options';
import BlockState from './block-state/block-state';
import AirBlockState from './block-state/types/air-block-state';
import SpawnZone from "./spawn-zone";
import {Constructor} from "../serialization/binary/serializable";
import Entity from "../utils/ecs/entity";
import ReadBuffer from "../serialization/binary/read-buffer";
import WriteBuffer from "../serialization/binary/write-buffer";

export interface GameMapConfig {
	spawnZones?: SpawnZone[]
	width?: number
	height?: number
	data: BlockState[]
}

export default class GameMap extends Entity {
	public needsUpdate: boolean;

	static BinaryOptions: MapBinaryOptions = MapBinaryOptions.shared
	static BLOCK_SIZE = 5;

	data: BlockState[] = []
	width: number = 0
	height: number = 0
	spawnZones: SpawnZone[] = []

	constructor(config: GameMapConfig) {
		super()

		this.spawnZones = config.spawnZones || []
		this.width = config.width || MapBinaryOptions.shared.DEFAULT_WIDTH
		this.height = config.height || MapBinaryOptions.shared.DEFAULT_HEIGHT
		this.data = config.data
		this.needsUpdate = true
	}

	getBlock(x: number, y: number): BlockState {
		if(x < 0 || y < 0 || x >= this.width || y >= this.height) return null
		return this.data[x + this.width * y]
	}

	setBlock(x: number, y: number, block: BlockState) {
		let index = x + y * this.width;

		this.emit("block-will-change", x, y, block)

		this.data[index] = block

		const lowX = Math.max(0, x - 1)
		const lowY = Math.max(0, y - 1)
		const highX = Math.min(this.width - 1, x + 1)
		const highY = Math.min(this.height - 1, y + 1)

		let base = lowX + lowY * this.width;
		index = base;

		for (let by = lowY; by <= highY; by++) {
			for (let bx = lowX; bx <= highX; bx++) {
				this.data[index++].update(this, bx, by)
			}
			index = (base += this.width)
		}
		this.emit("block-change", x, y)
	}

	spawnPointForTeam(id: number) {
		const zone = this.spawnZones[id];

		if(!zone) {
			return {
				x: Math.random() * this.width * GameMap.BLOCK_SIZE,
				y: Math.random() * this.height * GameMap.BLOCK_SIZE
			}
		}

		const x = (Math.random() * (zone.x2 - zone.x1) + zone.x1) * GameMap.BLOCK_SIZE;
		const y = (Math.random() * (zone.y2 - zone.y1) + zone.y1) * GameMap.BLOCK_SIZE;

		return {x: x, y: y}
	}

	damageBlock(x: number, y: number, d: number) {
		x = Math.floor(x)
		y = Math.floor(y)

		let block = this.getBlock(x, y);

		if(!block || block instanceof AirBlockState) return

		let health = block.getHealth()

		if(health - d <= 0) {
			this.setBlock(x, y, new AirBlockState())
		} else {
			block.setHealth(health - d)
			block.update(this, x, y)
			this.emit("block-damage", x, y)
		}
	}

	update() {
		this.needsUpdate = false
		let x = 0, y = 0;
		for(let block of this.data) {
			block.update(this, x, y);

			x++;
			if(x >= this.width) {
				x -= this.width
				y++
			}
		}
	}

	static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
		let options = GameMap.BinaryOptions.bufferToObject(decoder)

		let map = new this(options) as T
		(map as any as GameMap).update()
		return map
	}

	toBinary(encoder: WriteBuffer) {
		(this.constructor as typeof GameMap).BinaryOptions.objectToBuffer(encoder, this)
	}
}