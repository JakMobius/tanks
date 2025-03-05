import BlockState from './block-state/block-state';
import AirBlockState from './block-state/types/air-block-state';
import BlockDamageEvent from "../events/block-damage-event";
import BlockChangeEvent from "../events/block-change-event";
import EventHandlerComponent from 'src/utils/ecs/event-handler-component';
import MapTransmitter from 'src/entity/components/network/map/map-transmitter';
import { TransmitterSet } from 'src/entity/components/network/transmitting/transmitter-set';
import { ParameterInspector, VectorParameter } from 'src/entity/components/inspector/entity-inspector';


export default class TilemapComponent extends EventHandlerComponent {
	public needsUpdate: boolean;
	static BLOCK_SIZE = 5;

	width: number = 0
	height: number = 0
	blocks: BlockState[] = []

	constructor() {
		super()
		this.needsUpdate = true

		this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(MapTransmitter)
        })

		this.eventHandler.on("inspector-added", (inspector: ParameterInspector) => {
			let sizeParameter = new VectorParameter(2)
				.withName("Размер карты")
				.withPrefixes(["W", "H"])
				.withGetter(() => [this.width, this.height])
				.withSetter(([width, height]) => this.setSize(width, height))
				.updateOn("update")
				.requirePositive()
				.requireInteger()
				.replaceNaN()
				.setBounds(0, 250)

			inspector.addParameter(sizeParameter)
		})

		this.setSize(50, 50)
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

	setSize(x: number, y: number) {
		let oldWidth = this.width, oldHeight = this.height, oldBlocks = this.blocks
		this.width = x
		this.height = y
		this.blocks = new Array(this.width * this.height)
		for(let x = 0; x < this.width; x++) {
			for(let y = 0; y < this.height; y++) {
				if(x < oldWidth && y < oldHeight) {
					this.blocks[x + y * this.width] = oldBlocks[x + y * oldWidth]
				} else {
					this.blocks[x + y * this.width] = new AirBlockState()
				}
			}
		}
		this.update()
		this.entity?.emit("update")
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