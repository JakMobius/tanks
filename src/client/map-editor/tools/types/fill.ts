
import Tool from '../tool';
import GameMap from '../../../../map/game-map';
import ToolManager from '../toolmanager';
import BlockState from "../../../../map/block-state/block-state";
import TilemapComponent from "../../../../physics/tilemap-component";
import EditorMap from "../../editor-map";

export default class Fill extends Tool {
    public actionName: any;

    constructor(manager: ToolManager) {
        super(manager);

        this.image = "assets/img/fill.png"
        this.actionName = "Заливка"
    }

    mouseDown(x: number, y: number) {
        super.mouseDown(x, y);

        x = Math.floor(x / GameMap.BLOCK_SIZE)
        y = Math.floor(y / GameMap.BLOCK_SIZE)

        this.fill(x, y)
    }

    getBitset(bitset: Uint8Array, index: number) {
        return bitset[Math.floor(index >> 3)] & (1 << (index & 0b111))
    }

    setBitset(bitset: Uint8Array, index: number, value: boolean) {
        let byte = Math.floor(index >> 3)
        let bit = index & 0b111
        bitset[byte] &= (~(1 << bit))
        if(value) {
            bitset[byte] |= (1 << bit)
        }
    }

    fill(x: number, y: number) {
        const map = this.manager.world.getComponent(TilemapComponent).map as EditorMap
        let baseBlock = map.getBlock(x, y)

        if(!baseBlock) return

        let baseId = (baseBlock.constructor as typeof BlockState).typeId
        let copy = new Uint8Array(Math.ceil(map.data.length / 8))
        let carets = [x + y * map.width]

        while(carets.length) {
            let newCarets = []

            for(let caret of carets) {

                if(this.getBitset(copy, caret)) {
                    continue
                }

                let x = caret % map.width
                let y = Math.floor(caret / map.width)

                let block = map.getBlock(x, y)

                if((block.constructor as typeof BlockState).typeId !== baseId) {
                    continue
                }

                map.setBlock(x, y, this.manager.selectedBlock.clone())

                this.setBitset(copy, caret, true)

                if(x > 0) newCarets.push(caret - 1)
                if(x < map.width - 1) newCarets.push(caret + 1)
                if(y > 0) newCarets.push(caret - map.width)
                if(y < map.height - 1)newCarets.push(caret + map.width)
            }

            carets = newCarets
        }

        this.manager.setNeedsRedraw()
        map.history.commitActions(this.actionName)
    }
}