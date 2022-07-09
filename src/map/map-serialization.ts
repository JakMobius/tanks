
import ReadBuffer from "../serialization/binary/read-buffer";
import GameMap from "./game-map";

export default class MapSerialization {
    public static fromBuffer(data: Uint8Array): GameMap {
        const decoder = ReadBuffer.getShared(data.buffer)

        const signature = String.fromCharCode(...decoder.readBytes(4))
        if(signature != "TNKS") throw "Invalid signature"

        const version = decoder.readUint32()
        if(version != 1) throw "Unsupported file version: " + version

        return GameMap.fromBinary(decoder)
    }
}