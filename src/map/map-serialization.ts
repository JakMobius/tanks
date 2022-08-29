
import ReadBuffer from "../serialization/binary/read-buffer";
import GameMap from "./game-map";
import WriteBuffer from "../serialization/binary/write-buffer";

export default class MapSerialization {

    public static signature = "TNKS"
    public static signatureBuffer = new Uint8Array(MapSerialization.signature.split("").map(c => c.charCodeAt(0)))

    public static fromBuffer(data: Uint8Array): GameMap {
        const decoder = ReadBuffer.getShared(data.buffer)

        const signature = String.fromCharCode(...decoder.readBytes(MapSerialization.signature.length))
        if(signature != MapSerialization.signature) throw "Invalid signature"

        const version = decoder.readUint32()
        if(version != 1) throw "Unsupported file version: " + version

        return GameMap.fromBinary(decoder)
    }

    public static toBuffer(map: GameMap): Uint8Array {
        const encoder = WriteBuffer.shared

        encoder.writeBytes(MapSerialization.signatureBuffer)
        encoder.writeUint32(1)
        map.toBinary(encoder)

        return encoder.spitBuffer()
    }
}