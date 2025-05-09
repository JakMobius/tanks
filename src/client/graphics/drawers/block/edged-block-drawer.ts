import BlockDrawer from './block-drawer';
import Sprite, {SpriteRect} from 'src/client/graphics/sprite';
import TextureProgram from '../../programs/texture-program';
import BlockState from 'src/map/block-state/block-state';
import {squareQuadrangle} from "src/utils/quadrangle";
import { depths } from '../../depths';

export default class EdgedBlockDrawer extends BlockDrawer {
    public variants: Sprite[][];
    public spriteSize: number;
    public spritePath: string | string[]
    public halfSpriteSize: number;

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

    drawSlice(program: TextureProgram, x: number, y: number, slice: SpriteRect, s: number, h: number, dx: any, dy: any) {

        dx += slice.x
        dy += slice.y

        program.drawTexture(squareQuadrangle(x, y, h, h), dx, dy, s, s, depths.block)
    }

    draw(program: TextureProgram, x: number, y: number, block: BlockState) {
        if(!this.variants) {
            this.loadSprites()
        }

        let variant = this.variants[block.variant || 0]

        if((block.facing & 0b111111111111) === 0b000000000000) {
            this.drawSlice(program, x, y, variant[0].rect, this.spriteSize, 1, 0, 0)
        } else if((block.facing & 0b111111111111) === 0b100100100100) {
            this.drawSlice(program, x, y, variant[4].rect, this.spriteSize, 1, 0, 0)
        } else {
            const s = this.halfSpriteSize

            this.drawSlice(program, x, y + 0.5, variant[(block.facing >> 9) & 7].rect, s, 0.5, 0, s)
            this.drawSlice(program, x + 0.5, y + 0.5, variant[(block.facing >> 6) & 7].rect, s, 0.5, s, s)
            this.drawSlice(program, x + 0.5, y, variant[(block.facing >> 3) & 7].rect, s, 0.5, s, 0)
            this.drawSlice(program, x, y, variant[block.facing & 7].rect, s, 0.5, 0, 0)
        }

        this.drawCrack(program, x, y, block)
    }
}