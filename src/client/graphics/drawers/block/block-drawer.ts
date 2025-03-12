
import Sprite from 'src/client/graphics/sprite'
import BlockState from "src/map/block-state/block-state"
import TextureProgram from "src/client/graphics/programs/texture-program"
import {squareQuadrangle} from "src/utils/quadrangle"
import crackSprites from "textures/blocks/crack/%.texture.png"
import { depths } from '../../depths'

export default class BlockDrawer {
	public id: number;
	public crackSprites: Sprite[];

    loadSprites() {
        this.crackSprites = crackSprites.map(sprite => Sprite.named(sprite))
    }

    draw(program: TextureProgram, x: number, y: number, block: BlockState) {
        this.drawCrack(program, x, y, block)
    }

    drawCrack(program: TextureProgram, x: number, y: number, block: BlockState) {
        let Block = (block.constructor as typeof BlockState)
        if (!Block.typeId) return

        let crack = Math.floor(block.damage * this.crackSprites.length)
        
        if(crack) {
            program.drawSprite(this.crackSprites[crack - 1], squareQuadrangle(x, y, 1, 1),
                depths.blockCrack
            )
        }
    }
}