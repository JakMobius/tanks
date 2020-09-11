const EventEmitter = require("/src/utils/eventemitter")
const MapBinaryOptions = require("./mapbinaryoptions")
const BlockState = require("./blockstate/blockstate")
const AirBlockState = require("./blockstate/types/airblockstate")

require("./blockstate/blockstateloader")

class GameMap extends EventEmitter {

	static BinaryOptions = MapBinaryOptions.shared
	static BLOCK_SIZE = 20;

	/**
	 *
	 * @type {BlockState[]}
	 */
	data = []

	/**
	 *
	 * @type {number}
	 */
	width = 0

	/**
	 *
	 * @type {number}
	 */
	height = 0

	/**
	 * @type {SpawnZone[]}
	 */

	spawnZones = []

	constructor(config) {
		super()
		config = config || {}

		this.spawnZones = config.spawnZones || []
		this.width = config.width || GameMap.DEFAULT_WIDTH
		this.height = config.height || GameMap.DEFAULT_HEIGHT
		this.data = config.data
		this.needsUpdate = true
	}

	getBlock(x, y) {
		if(x < 0 || y < 0 || x >= this.width || y >= this.height) return null
		return this.data[x + this.width * y]
	}

	setBlock(x, y, block) {
		let index = x + y * this.width;

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

		this.emit("block-update", x, y)
	}

	spawnPointForTeam(id) {
		const zone = this.spawnZones[id];

		if(!zone) {
			return {
				x: Math.random() * this.map.width * GameMap.BLOCK_SIZE,
				y: Math.random() * this.map.height * GameMap.BLOCK_SIZE
			}
		}

		const x = (Math.random() * (zone.x2 - zone.x1) + zone.x1) * GameMap.BLOCK_SIZE;
		const y = (Math.random() * (zone.y2 - zone.y1) + zone.y1) * GameMap.BLOCK_SIZE;

		return {x: x, y: y}
	}

	damageBlock(x, y, d) {
		x = Math.floor(x)
		y = Math.floor(y)

		let b = this.getBlock(x, y);

		if(!b || b instanceof AirBlockState) return

		let health = b.getHealth()

		if(health - d < 0) {
			this.setBlock(x, y, new AirBlockState())
		} else {
			b.setHealth(health - d)
			b.update(this, x, y)
		}

		this.emit("block-update", x, y)
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

	static fromBinary(decoder) {
		let options = this.BinaryOptions.convertBinary(decoder)

		return new this(options)
	}

	toBinary(encoder, flags) {
		this.constructor.BinaryOptions.convertOptions(encoder, this, flags)
	}
}

module.exports = GameMap