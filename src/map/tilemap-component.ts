import BlockState from './block-state/block-state';
import AirBlockState from './block-state/types/air-block-state';
import BlockDamageEvent from "../events/block-damage-event";
import BlockChangeEvent from "../events/block-change-event";
import EventHandlerComponent from 'src/utils/ecs/event-handler-component';
import PropertyModification, { PropertyInspector, StringProperty, VectorProperty } from 'src/entity/components/inspector/property-inspector';
import HistoryManager from 'src/client/map-editor/history/history-manager';
import Entity from 'src/utils/ecs/entity';
import ModificationGroup from 'src/client/map-editor/history/modification-group';

export function idToChar(id: number) {
	if(id > 26 || id < 0) throw new Error("ID out of bounds")
	if(id === 0) return '-'
	return String.fromCharCode('a'.charCodeAt(0) + id - 1)
}

export function charToId(char: string) {
	if(char === '-') return 0
	let code = char.charCodeAt(0) - 'a'.charCodeAt(0) + 1
	if(code < 1 || code > 26) throw new Error("Invalid character")
	return code
}

export default class TilemapComponent extends EventHandlerComponent {
	public needsUpdate: boolean;
	static DEFAULT_SCALE = 5;

	width: number = 0
	height: number = 0
	blocks: BlockState[] = []

	constructor() {
		super()
		this.needsUpdate = true

		this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
			let sizeProperty = new VectorProperty("mapSize", 2)
				.withName("Размер карты")
				.withPrefixes(["W", "H"])
				.withGetter(() => [this.width, this.height])
				.withSetter(([width, height]) => this.setSize(width, height))
				.withModificationCallback((historyManager: HistoryManager, entity: Entity, value: [number, number]) => {
					let group = new ModificationGroup("Изменение размера карты")

					// When the map size is decreased, the map is cropped. This is irreversible.
					// So in case user undo the operation, the cropped blocks should be restored.
					if(this.width > value[0] || this.height > value[1]) {
						let blocks = this.getBlocksString()
						group.add({
							perform: () => {},
							revert: () => this.setBlocksString(blocks),
						})
					}

					group.add(new PropertyModification(entity, sizeProperty, value))
					historyManager.registerModification(group)
				})
				.updateOn("update")
				.requirePositive()
				.requireInteger()
				.replaceNaN()
				.setBounds(0, 400)

			let blocksProperty = new StringProperty("blocks")
				.withHidden(true)
				.withGetter(() => this.getBlocksString())
				.withSetter((value: string) => this.setBlocksString(value))

			inspector.addProperty(sizeProperty)
			inspector.addProperty(blocksProperty)
		})
		
		this.setSize(50, 50)
	}

	localToBlockX(x: number) {
		return Math.floor(x + this.width / 2)
	}

	localToBlockY(y: number) {
		return Math.floor(y + this.height / 2)
	}

	blockToLocalX(x: number) {
		return x - this.width / 2
	}

	blockToLocalY(y: number) {
		return y - this.height / 2
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

		let event = new BlockChangeEvent(this.entity, oldBlock, block, x, y)
		this.entity.emit("block-change", event)
	}

	setSize(x: number, y: number) {
		this.entity?.emit("will-update")
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
		let block = this.getBlock(x, y);

		if(!block || block instanceof AirBlockState) return

		let health = block.getHealth()

		let event =  new BlockDamageEvent(block, x, y, d)
		this.entity.emit("block-damage", event)
		if(event.cancelled) return

		if(health - d <= 0) {
			this.setBlock(x, y, new AirBlockState())
		} else {
			block.setHealth(health - d)
			block.update(this, x, y)
		}
	}

	setMap(width: number, height: number, blocks: BlockState[] | string) {
		this.entity.emit("will-update")
		this.width = width
		this.height = height
		if(typeof blocks === "string") {
			this.setBlocksString(blocks)
		} else {
			this.blocks = blocks
		}
		this.update()
		this.entity.emit("update")
    }

	getBlocksString() {
		let blocks = this.width * this.height
		let string = ""
		for(let i = 0; i < blocks; i++) {
			string += idToChar((this.blocks[i].constructor as typeof BlockState).typeId)
		}
		return string
	}

	setBlocksString(blocksString: string) {
		this.entity.emit("will-update")
		let blocks = this.width * this.height
		if(blocks !== blocksString.length) throw new Error("Invalid string length")
		for(let i = 0; i < blocks; i++) {
			let id = (this.blocks[i].constructor as typeof BlockState).typeId
			let newId = charToId(blocksString[i])
			
			if(id === newId) {
				let maxHealth = (this.blocks[i].constructor as typeof BlockState).health
				this.blocks[i].setHealth(maxHealth)
			} else {
				const Block = BlockState.getBlockStateClass(newId)
				this.blocks[i] = new Block()
			}
		}
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