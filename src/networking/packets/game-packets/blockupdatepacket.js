
const BinaryPacket = require("../../binarypacket")
const BlockState = require("../../../utils/map/blockstate/blockstate")

class BlockUpdatePacket extends BinaryPacket {
    static typeName() { return 13 }

    constructor(x, y, block) {
        super();

        this.x = x
        this.y = y
        this.block = block
    }

    toBinary(encoder) {
        encoder.writeUint16(this.x)
        encoder.writeUint16(this.y)
        encoder.writeUint8(this.block.constructor.typeId)
        this.block.constructor.BinaryOptions.convertOptions(encoder, this.block)
    }

    static fromBinary(decoder) {
        let x = decoder.readUint16()
        let y = decoder.readUint16()
        let id = decoder.readUint8()

        let Block = BlockState.getBlockStateClass(id)
        let block = new Block(Block.BinaryOptions.convertBinary(decoder))

        return new BlockUpdatePacket(
            x, y, block
        )
    }
}

BinaryPacket.register(BlockUpdatePacket)
module.exports = BlockUpdatePacket