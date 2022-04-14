
import BinaryPacket from '../../binary-packet';
import BlockState from '../../../map/block-state/block-state';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class BlockUpdatePacket extends BinaryPacket {
	public x: number;
	public y: number;
	public block: BlockState;

    static typeName = 13

    constructor(x: number, y: number, block: BlockState) {
        super();

        this.x = x
        this.y = y
        this.block = block
    }

    toBinary(encoder: WriteBuffer): void {
        const blockType = this.block.constructor as typeof BlockState
        encoder.writeUint16(this.x)
        encoder.writeUint16(this.y)
        encoder.writeUint8(blockType.typeId)
        blockType.BinaryOptions.objectToBuffer(encoder, this.block)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let x = decoder.readUint16()
        let y = decoder.readUint16()
        let id = decoder.readUint8()

        let Block = BlockState.getBlockStateClass(id)
        let block = new Block(Block.BinaryOptions.bufferToObject(decoder))

        return new BlockUpdatePacket(
            x, y, block
        ) as any as T
    }
}

BinarySerializer.register(BlockUpdatePacket)