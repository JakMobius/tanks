import FlagHandler from "src/serialization/binary/parsers/flag-handler";
import BinaryFlaggedCoder from "src/serialization/binary/parsers/binary-flagged-coder";
import WriteBuffer from "src/serialization/binary/write-buffer";
import ReadBuffer from "src/serialization/binary/read-buffer";
import BlockState from "./block-state";

export default class BlockStateBinaryOptions extends BinaryFlaggedCoder {

    static DAMAGE_FLAG = 0x0001;
    static shared = new BlockStateBinaryOptions()

    constructor() {
        super();

        this.addFlagHandler(BlockStateBinaryOptions.DAMAGE_FLAG, new FlagHandler()
            .setUnpacker((decoder, object) => {
                object.damage = decoder.readUint16() / 0xFFFF
            })
            .setPacker((encoder, object) => {
                encoder.writeUint16(object.damage * 0xFFFF)
            })
            .packDecision((object) => {
                return Number.isFinite(object.damage) && object.damage > 0
            })
        )
    }

    objectToBlock(encoder: WriteBuffer, options: BlockState) {
        encoder.writeUint8((options.constructor as typeof BlockState).typeId)
        super.objectToBlock(encoder, options);
    }

    blockToObject(decoder: ReadBuffer, size: number, options: any) {
        options.id = decoder.readUint8()
        super.blockToObject(decoder, size - 1, options);
    }
}