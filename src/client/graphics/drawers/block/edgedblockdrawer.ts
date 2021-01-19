
import BlockDrawer from './blockdrawer';
import Sprite, {SpriteRect} from '../../../sprite';
import GameMap from '../../../../utils/map/gamemap';
import TextureProgram from '../../programs/textureprogram';
import BlockState from 'src/utils/map/blockstate/blockstate';

class EdgedBlockDrawer extends BlockDrawer {
    public variants: Sprite[][];
    public spritePath: any;
    public spriteSize: any;
    public halfSpriteSize: any;

    constructor() {
        super();

        this.variants = null

        this.spritePath = "blocks/concrete"
    }

    loadSprites() {
        super.loadSprites()
        this.variants = []

        if (Array.isArray(this.spritePath)) {
            for (let path of this.spritePath) {
                this.variants.push(this.loadVariant(path))
            }
        } else if (typeof this.spritePath == "string") {
            this.variants.push(this.loadVariant(this.spritePath))
        }

        this.spriteSize = this.variants[0][0].rect.w
        this.halfSpriteSize = this.spriteSize / 2
    }

    loadVariant(path: string): Sprite[] {
        if (path.length && !path.endsWith("/")) {
            path += "/"
        }

        let allWalls = Sprite.named(path + "all-walls")
        let allSides = Sprite.named(path + "all-sides")
        let allCorners = Sprite.named(path + "all-corners")
        let leftRightWalls = Sprite.named(path + "left-right-walls")
        let topBottomWalls = Sprite.named(path + "top-bottom-walls")

        return [
            allWalls,
            topBottomWalls,
            leftRightWalls,
            allCorners,
            allSides
        ]
    }

    drawSlice(program: TextureProgram, x: number, y: number, slice: SpriteRect, s: any, h: number, dx: any, dy: any) {
        dx += slice.x
        dy += slice.y
        program.vertexBuffer.appendArray([
            x, y, dx, dy,
            x + h, y, dx + s, dy,
            x, y + h, dx, dy + s,
            x + h, y + h, dx + s, dy + s
        ])

        let base = program.textures * 4

        program.indexBuffer.appendArray([
            base, base + 1, base + 3, base, base + 2, base + 3
        ])

        program.textures++
    }

    draw(program: TextureProgram, x: number, y: number, block: BlockState) {
        if(!this.variants) {
            this.loadSprites()
        }

        let variant = this.variants[block.variant || 0]

        x *= GameMap.BLOCK_SIZE
        y *= GameMap.BLOCK_SIZE

        const half = GameMap.BLOCK_SIZE / 2

        if((block.facing & 0b111111111111) === 0b000000000000) {
            this.drawSlice(program, x, y, variant[0].rect, this.spriteSize, GameMap.BLOCK_SIZE, 0, 0)
        } else if((block.facing & 0b111111111111) === 0b100100100100) {
            this.drawSlice(program, x, y, variant[4].rect, this.spriteSize, GameMap.BLOCK_SIZE, 0, 0)
        } else {
            const s = this.halfSpriteSize
            const h = GameMap.BLOCK_SIZE / 2

            this.drawSlice(program, x, y + half, variant[(block.facing >> 9) & 7].rect, s, h, 0, s)
            this.drawSlice(program, x + half, y + half, variant[(block.facing >> 6) & 7].rect, s, h, s, s)
            this.drawSlice(program, x + half, y, variant[(block.facing >> 3) & 7].rect, s, h, s, 0)
            this.drawSlice(program, x, y, variant[block.facing & 7].rect, s, h, 0, 0)
        }

        super.draw(program, x, y, block)
    }
}

export default EdgedBlockDrawer;