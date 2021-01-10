
import BinaryOptions, {FlagHandler} from '../binaryoptions';
import BlockState from '../../utils/map/blockstate/blockstate';
import SpawnZone from './spawnzone';
import BinaryEncoder from "../../serialization/binary/binaryencoder";
import BinaryDecoder from "../../serialization/binary/binarydecoder";

class MapBinaryOptions extends BinaryOptions {

    DATA_FLAG = 0x0000;
    SIZE_FLAG = 0x0001;
    SPAWN_ZONES_FLAG = 0x0002;

    DEFAULT_WIDTH = 50;
    DEFAULT_HEIGHT = 50;

    static shared = new MapBinaryOptions()

    constructor() {
        super();

        this.addFlagHandler(new FlagHandler(this.SIZE_FLAG)
            .setPacker((encoder: BinaryEncoder, options: any) => {
                encoder.writeUint32(options.width === undefined ? this.DEFAULT_WIDTH : options.width)
                encoder.writeUint32(options.height === undefined ? this.DEFAULT_WIDTH : options.height)
            })
            .setUnpacker((decoder: BinaryDecoder, options: any) => {
                options.width = decoder.readUint32()
                options.height = decoder.readUint32()
            })
        )

        this.addFlagHandler(new FlagHandler(this.DATA_FLAG)
            .setPacker((encoder: BinaryEncoder, options: any) => {
                for(let block of options.data) {
                    const Block = block.constructor
                    encoder.writeUint8(Block.typeId)
                    const BinaryOptions = Block.BinaryOptions
                    BinaryOptions.convertOptions(encoder, block)
                }
            })
            .setUnpacker((decoder, options) => {
                if(options.width === undefined) options.width = this.DEFAULT_WIDTH
                if(options.height === undefined) options.height = this.DEFAULT_HEIGHT
                const size = options.width * options.height

                let blockOptions
                options.data = new Array(size)

                for(let i = 0; i < size; i++) {
                    blockOptions = {}
                    const id = decoder.readUint8()
                    const Block = BlockState.getBlockStateClass(id)

                    const BinaryOptions = Block.BinaryOptions
                    BinaryOptions.convertBinary(decoder, blockOptions)
                    options.data[i] = new Block({})
                }
            })
        )

        this.addFlagHandler(new FlagHandler(this.SPAWN_ZONES_FLAG)
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

export default MapBinaryOptions;