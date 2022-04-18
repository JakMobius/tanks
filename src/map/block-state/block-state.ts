import BlockStateBinaryOptions from './block-state-binary-options';
import GameMap from "../game-map";

interface BlockStateConfig {
    damage?: number
    solid?: boolean
}

export default class BlockState {
    public variant: number
	public damage: number;
	public solid: boolean;
	public facing: number;
    static BinaryOptions = BlockStateBinaryOptions.shared

    static Types = new Map<number, typeof BlockState>()

    static health = 16000
    static isSolid = true
    static typeName = "unspecified"
    static typeId = 0

    constructor(options?: BlockStateConfig) {
        options = options || {}
        this.damage = options.damage || 0
        this.solid = options.solid || (this.constructor as typeof BlockState).isSolid
        this.facing = 0
    }

    clone() {
        return new (this.constructor as typeof BlockState)(this)
    }

    update(map: GameMap, x: number, y: number) {
        if(this.facing !== -1) {
            this.updateNeighbourFacing(map, x, y)
        }
        map.emit("block-update", x, y)
    }

    getNeighbourId(map: GameMap, x: number, y: number): number {
        let block = map.getBlock(x, y);
        if(block) return (block.constructor as typeof BlockState).typeId
        return 0
    }

    updateNeighbourFacing(map: GameMap, x: number, y: number) {
        const id = (this.constructor as typeof BlockState).typeId

        this.facing = 0

        let sides = 0

        sides |= (this.getNeighbourId(map, x - 1, y - 1) === id) as any as number << 7
        sides |= (this.getNeighbourId(map, x,y - 1) === id) as any as number << 6
        sides |= (this.getNeighbourId(map, x + 1, y - 1) === id) as any as number << 5
        sides |= (this.getNeighbourId(map, x + 1, y) === id) as any as number << 4
        sides |= (this.getNeighbourId(map, x + 1, y + 1) === id) as any as number << 3
        sides |= (this.getNeighbourId(map, x, y + 1) === id) as any as number << 2
        sides |= (this.getNeighbourId(map, x - 1, y + 1) === id) as any as number << 1
        sides |= (this.getNeighbourId(map, x - 1, y) === id) as any as number << 0

        sides |= sides << 8

        for (let i = 0; i < 4; i++) {
            let t = sides
            let corner = 4

            if(i === 0) {
                t &= 0b00000111
            } else if(i === 1) {
                t &= 0b00011100
                t >>= 2
            } else if(i === 2) {
                t &= 0b01110000
                t >>= 4
            } else {
                t &= 0b11000001
                t = (t >> 6) | ((t & 1) << 2)
            }

            if(t === 0b001) corner = 1
            if(t === 0b101) corner = 3
            if(t === 0b111) corner = 4
            if(t === 0b011) corner = 1
            if(t === 0b000) corner = 0
            if(t === 0b100) corner = 2
            if(t === 0b110) corner = 2
            if(t === 0b010) corner = 0

            if(i % 2 === 1) {
                if(corner === 1) corner = 2
                else if(corner === 2) corner = 1
            }

            this.facing <<= 3
            this.facing |= corner
        }
    }

    getHealth() {
        return (this.constructor as typeof BlockState).health * (1 - this.damage)
    }

    setHealth(health: number) {
        this.damage = 1 - health / (this.constructor as typeof BlockState).health
    }

    static registerBlockStateClass(clazz: typeof BlockState) {
        this.Types.set(clazz.typeId, clazz)
    }

    static getBlockStateClass(id: number): typeof BlockState {
        return this.Types.get(id) || BlockState
    }
}