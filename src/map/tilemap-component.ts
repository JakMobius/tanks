import BlockState from './block-state/block-state';
import AirBlockState from './block-state/types/air-block-state';
import BlockDamageEvent from "../events/block-damage-event";
import BlockChangeEvent from "../events/block-change-event";
import Entity from 'src/utils/ecs/entity';
import EventHandlerComponent from 'src/utils/ecs/event-handler-component';
import MapTransmitter from 'src/entity/components/network/map/map-transmitter';
import { TransmitterSet } from 'src/entity/components/network/transmitting/transmitter-set';


export default class TilemapComponent extends EventHandlerComponent {
	public needsUpdate: boolean;
	static BLOCK_SIZE = 5;

	width: number = 0
	height: number = 0
	blocks: BlockState[] = []

	constructor() {
		super()
		this.width = 0
		this.height = 0
		this.blocks = []
		this.needsUpdate = true

		this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(MapTransmitter)
        })
	}

	getBlock(x: number, y: number): BlockState {
		if(x < 0 || y < 0 || x >= this.width || y >= this.height) return null
		return this.blocks[x + this.width * y]
	}

	setBlock(x: number, y: number, block: BlockState) {
		let index = x + y * this.width;

		let oldBlock = this.blocks[index]
		this.blocks[index] = block

		const lowX = Math.max(0, x - 1)
		const lowY = Math.max(0, y - 1)
		const highX = Math.min(this.width - 1, x + 1)
		const highY = Math.min(this.height - 1, y + 1)

		let base = lowX + lowY * this.width;
		index = base;

		for (let by = lowY; by <= highY; by++) {
			for (let bx = lowX; bx <= highX; bx++) {
				this.blocks[index++].update(this, bx, by)
			}
			index = (base += this.width)
		}

		let event = new BlockChangeEvent(oldBlock, block, x, y)
		this.entity.emit("block-change", event)
	}

	damageBlock(x: number, y: number, d: number) {
		x = Math.floor(x)
		y = Math.floor(y)

		let block = this.getBlock(x, y);

		if(!block || block instanceof AirBlockState) return

		let health = block.getHealth()

		let event = new BlockDamageEvent(block, x, y, d)
		this.entity.emit("block-damage", event)
		if(event.cancelled) return

		if(health - d <= 0) {
			this.setBlock(x, y, new AirBlockState())
		} else {
			block.setHealth(health - d)
			block.update(this, x, y)
		}
	}

	setMap(width: number, height: number, blocks: BlockState[]) {
		this.width = width
		this.height = height
		this.blocks = blocks
		this.update()
		this.entity.emit("update")
    }

	update() {
		this.needsUpdate = false
		let x = 0, y = 0;
		for(let block of this.blocks) {
			block.update(this, x, y);

			x++;
			if(x >= this.width) {
				x -= this.width
				y++
			}
		}
	}
}