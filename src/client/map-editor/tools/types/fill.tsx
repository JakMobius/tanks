import Tool from '../tool';
import ToolManager from '../toolmanager';
import BlockState from "src/map/block-state/block-state";
import GameMapHistoryComponent from "src/client/map-editor/history/game-map-history-component";

export default class Fill extends Tool {
    public actionName: any;

    constructor(manager: ToolManager) {
        super(manager);

        this.image = "static/map-editor/fill.png"
        this.actionName = "Заливка"
    }

    mouseDown(x: number, y: number) {
        super.mouseDown(x, y);

        x = Math.floor(x / 1)
        y = Math.floor(y / 1)

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
        const tilemap = this.manager.tilemap
        let baseBlock = tilemap.getBlock(x, y)

        if(!baseBlock) return

        let baseId = (baseBlock.constructor as typeof BlockState).typeId
        let copy = new Uint8Array(Math.ceil(tilemap.blocks.length / 8))
        let carets = [x + y * tilemap.width]

        while(carets.length) {
            let newCarets = []

            for(let caret of carets) {

                if(this.getBitset(copy, caret)) {
                    continue
                }

                let x = caret % tilemap.width
                let y = Math.floor(caret / tilemap.width)

                let block = tilemap.getBlock(x, y)

                if((block.constructor as typeof BlockState).typeId !== baseId) {
                    continue
                }

                tilemap.setBlock(x, y, this.manager.selectedBlock.clone())

                this.setBitset(copy, caret, true)

                if(x > 0) newCarets.push(caret - 1)
                if(x < tilemap.width - 1) newCarets.push(caret + 1)
                if(y > 0) newCarets.push(caret - tilemap.width)
                if(y < tilemap.height - 1)newCarets.push(caret + tilemap.width)
            }

            carets = newCarets
        }

        this.manager.setNeedsRedraw()

        const history = tilemap.entity.getComponent(GameMapHistoryComponent)
        history.commitActions(this.actionName)
    }
}