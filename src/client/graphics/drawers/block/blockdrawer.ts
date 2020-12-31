
import Sprite from '../../../sprite';
import GameMap from '@/utils/map/gamemap';

class BlockDrawer {
	public id: any;
	public crackSprites: any;

    constructor() {
        this.id = 0
    }

    loadSprites() {
        this.crackSprites = [
            Sprite.named("blocks/crack/1"),
            Sprite.named("blocks/crack/2"),
            Sprite.named("blocks/crack/3"),
            Sprite.named("blocks/crack/4"),
            Sprite.named("blocks/crack/5")
        ]
    }

    /**
     *
     * @param {TextureProgram} program
     * @param x
     * @param y
     * @param {BlockState} block
     */
    draw(program, x, y, block) {
        if (!block.constructor.typeId) return
        let crack = Math.floor(block.damage * 6)
        if(crack) {
            program.drawSprite(this.crackSprites[crack - 1], x, y, GameMap.BLOCK_SIZE, GameMap.BLOCK_SIZE)
        }
    }
}

export default BlockDrawer;