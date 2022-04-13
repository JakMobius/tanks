import SpawnZone from './spawn-zone';
import BinaryFlaggedCoder from "../serialization/binary/parsers/binary-flagged-coder";
import FlagHandler from "../serialization/binary/parsers/flag-handler";
import BlockStateBinaryOptions from "./block-state/block-state-binary-options";
import ReadBuffer from "../serialization/binary/read-buffer";
import BlockState from "./block-state/block-state";
import BinaryBlockCoder from "../serialization/binary/parsers/binary-block-coder";

export default class MapBinaryOptions extends BinaryFlaggedCoder {

    DATA_FLAG = 0x0000;
    SIZE_FLAG = 0x0001;
    SPAWN_ZONES_FLAG = 0x0002;

    DEFAULT_WIDTH = 50;
    DEFAULT_HEIGHT = 50;

    static shared = new MapBinaryOptions()

    static blockFromDecoder(decoder: ReadBuffer): BlockState {
        let block = null
        BinaryBlockCoder.decodeBlock(decoder, (decoder, size) => {
            const id = decoder.readUint8()
            decoder.offset--

            const Block = BlockState.getBlockStateClass(id)
            const BinaryOptions = Block.BinaryOptions
            let options = {}
            BinaryOptions.blockToObject(decoder, size - 1, options)
            block = new Block(options)
        })
        return block
    }

    constructor() {
        super();

        this.addFlagHandler(this.SIZE_FLAG, new FlagHandler()
            .setPacker((encoder, options: any) => {
                encoder.writeUint32(options.width === undefined ? this.DEFAULT_WIDTH : options.width)
                encoder.writeUint32(options.height === undefined ? this.DEFAULT_WIDTH : options.height)
            })
            .setUnpacker((decoder, options: any) => {
                options.width = decoder.readUint32()
                options.height = decoder.readUint32()
            })
        )

        this.addFlagHandler(this.DATA_FLAG, new FlagHandler()
            .setPacker((encoder, options: any) => {
                for(let block of options.data) {
                    block.constructor.BinaryOptions.objectToBuffer(encoder, block)
                }
            })
            .setUnpacker((decoder, options) => {
                if(options.width === undefined) options.width = this.DEFAULT_WIDTH
                if(options.height === undefined) options.height = this.DEFAULT_HEIGHT
                const size = options.width * options.height

                options.data = new Array(size)

                for(let i = 0; i < size; i++) {
                    options.data[i] = MapBinaryOptions.blockFromDecoder(decoder)
                }
            })
        )

        this.addFlagHandler(this.SPAWN_ZONES_FLAG, new FlagHandler()
            .setPacker((encoder, options) => {
                encoder.writeUint16(options.spawnZones.length)

                for(let zone of options.spawnZones) {
                    zone.toBinary(encoder)
                }
            })
            .setUnpacker((decoder, options) => {
                let count = decoder.readUint16()

                options.spawnZones = []

                while(count--) {
                    options.spawnZones.push(SpawnZone.fromBinary(decoder))
                }
            })
        )
    }
}