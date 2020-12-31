
import BinaryOptions from '../../binaryoptions';

class BlockStateBinaryOptions extends BinaryOptions {

    static DAMAGE_FLAG = 0x0001;
    static shared = new BlockStateBinaryOptions()

    constructor() {
        super();

        this.trimFlagIdentifier = true

        this.addFlagHandler(new BinaryOptions.FlagHandler(BlockStateBinaryOptions.DAMAGE_FLAG)
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
}

export default BlockStateBinaryOptions;