
import BinaryPacket from '../../binarypacket';
import GameMap from '../../../utils/map/gamemap';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";

export default class MapPacket extends BinaryPacket {
	public map: GameMap;

    static typeName = 1

    static requireLargeIndices = true

    constructor(map: GameMap) {
        super();

        this.map = map
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let map = GameMap.fromBinary(decoder)
        map.update()
        return new MapPacket(map) as any as T
    }

    toBinary(encoder: BinaryEncoder) {
        this.map.toBinary(encoder, [
            GameMap.BinaryOptions.SIZE_FLAG,
            GameMap.BinaryOptions.DATA_FLAG
        ])
    }
}

BinarySerializer.register(MapPacket)