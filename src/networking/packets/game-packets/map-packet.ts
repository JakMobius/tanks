
import BinaryPacket from '../../binary-packet';
import GameMap from '../../../map/game-map';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import WriteBuffer from "../../../serialization/binary/write-buffer";
import ReadBuffer from "../../../serialization/binary/read-buffer";

export default class MapPacket extends BinaryPacket {
	public map: GameMap;

    static typeName = 1

    static requireLargeIndices = true

    constructor(map: GameMap) {
        super();

        this.map = map
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let map = GameMap.fromBinary(decoder)
        map.update()
        return new MapPacket(map) as any as T
    }

    toBinary(encoder: WriteBuffer): void {
        this.map.toBinary(encoder)
    }
}

BinarySerializer.register(MapPacket)