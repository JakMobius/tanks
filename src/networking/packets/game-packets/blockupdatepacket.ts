
import BinaryPacket from '../../binarypacket';
import BlockState from '../../../utils/map/blockstate/blockstate';
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";

class BlockUpdatePacket extends BinaryPacket {
	public x: any;
	public y: any;
	public block: any;

    static typeName = 13

    constructor(x: number, y: number, block: BlockState) {
        super();

        this.x = x
        this.y = y
        this.block = block
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint16(this.x)
        encoder.writeUint16(this.y)
        encoder.writeUint8(this.block.constructor.typeId)
        this.block.constructor.BinaryOptions.convertOptions(encoder, this.block)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let x = decoder.readUint16()
        let y = decoder.readUint16()
        let id = decoder.readUint8()

        let Block = BlockState.getBlockStateClass(id)
        let block = new Block(Block.BinaryOptions.convertBinary(decoder))

        return new BlockUpdatePacket(
            x, y, block
        ) as any as T
    }
}

BinarySerializer.register(BlockUpdatePacket)
export default BlockUpdatePacket;