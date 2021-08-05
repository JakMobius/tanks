
import Sprite from '../../../sprite';
import GameMap from 'src/map/gamemap';
import BlockState from "../../../../map/blockstate/blockstate";
import TextureProgram from "../../programs/texture-program";
import {squareQuadrangle} from "../../../../utils/quadrangle";

export default class BlockDrawer {
	public id: number;
	public crackSprites: any;

    loadSprites() {
        this.crackSprites = [
            Sprite.named("blocks/crack/1"),
            Sprite.named("blocks/crack/2"),
            Sprite.named("blocks/crack/3"),
            Sprite.named("blocks/crack/4"),
            Sprite.named("blocks/crack/5")
        ]
    }


    draw(program: TextureProgram, x: number, y: number, block: BlockState) {
        if (!(block.constructor as typeof BlockState).typeId) return
        let crack = Math.floor(block.damage * 6)
        if(crack) {
            program.drawSprite(this.crackSprites[crack - 1], squareQuadrangle(x, y, GameMap.BLOCK_SIZE, GameMap.BLOCK_SIZE))
        }
    }
}