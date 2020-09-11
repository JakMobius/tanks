
const Tool = require("../tool")
const GameMap = require("../../../../utils/map/gamemap")

class Fill extends Tool {
    constructor(scene) {
        super(scene);

        this.image = "../assets/mapeditor/fill.png"
        this.actionName = "Заливка"
    }

    mouseDown(x, y) {
        super.mouseDown(x, y);

        x = Math.floor(x / GameMap.BLOCK_SIZE)
        y = Math.floor(y / GameMap.BLOCK_SIZE)

        this.fill(x, y)
    }

    getBitset(bitset, index) {
        return bitset[Math.floor(index >> 3)] & (1 << (index & 0b111))
    }

    setBitset(bitset, index, value) {
        let byte = Math.floor(index >> 3)
        let bit = index & 0b111
        bitset[byte] &= (~(1 << bit))
        if(value) {
            bitset[byte] |= (1 << bit)
        }
    }

    fill(x, y) {
        const map = this.manager.map
        let baseBlock = map.getBlock(x, y)

        if(!baseBlock) return

        let baseId = baseBlock.constructor.typeId
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

                if(block.constructor.typeId !== baseId) {
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

        this.manager.setNeedsRedraw(true)
        map.history.commitActions(this.actionName)
    }
}

module.exports = Fill