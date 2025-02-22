
import Sprite from 'src/client/graphics/sprite'
import BlockState from "src/map/block-state/block-state"
import TextureProgram from "src/client/graphics/programs/texture-program"
import {squareQuadrangle} from "src/utils/quadrangle"
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component"
import crackSprites from "textures/blocks/crack/%.texture.png"
import TilemapComponent from 'src/map/tilemap-component'

export default class BlockDrawer {
	public id: number;
	public crackSprites: Sprite[];

    loadSprites() {
        this.crackSprites = crackSprites.map(sprite => Sprite.named(sprite))
    }

    draw(program: TextureProgram, x: number, y: number, block: BlockState) {
        if (!(block.constructor as typeof BlockState).typeId) return
        let crack = Math.floor(block.damage * 6)
        if(crack) {
            program.drawSprite(this.crackSprites[crack - 1], squareQuadrangle(x, y, TilemapComponent.BLOCK_SIZE, TilemapComponent.BLOCK_SIZE),
                WorldDrawerComponent.depths.blockCrack
            )
        }
    }
}