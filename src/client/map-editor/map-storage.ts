import {base64ToBytes, bytesToBase64} from 'src/utils/base64';
import pako from 'pako';
import ReadBuffer from "src/serialization/binary/read-buffer";
import WriteBuffer from "src/serialization/binary/write-buffer";
import MapSerialization from "src/map/map-serialization";
import GameMap from "src/map/game-map";
import GameMapNameComponent from "./map-name-component";
import GameMapHistoryComponent from "./history/game-map-history-component";
import GameMapSizeComponent from "src/client/map-editor/map-size-component";

export default class MapStorage {

    static read() {
        let base64 = window.localStorage.getItem("editor-maps")
        if (!base64) return [] as GameMap[]

        let result = []
        try {
            let data = base64ToBytes(base64)

            let decoder = new ReadBuffer(data.buffer);

            let maps = decoder.readInt16()

            for (let i = 0; i < maps; i++) {
                let length = decoder.readInt32()
                let bytes = decoder.readBytes(length)

                try {
                    let map = MapSerialization.fromBuffer(pako.inflate(bytes))

                    let nameComponent = map.getComponent(GameMapNameComponent)
                    let historyComponent = map.getComponent(GameMapHistoryComponent)
                    let sizeComponent = new GameMapSizeComponent()
                    sizeComponent.size = bytes.byteLength
                    map.addComponent(sizeComponent)

                    if (!nameComponent) {
                        nameComponent = new GameMapNameComponent()
                        nameComponent.name = "Карта"
                        map.addComponent(nameComponent)
                    }

                    if (!historyComponent) {
                        historyComponent = new GameMapHistoryComponent()
                        map.addComponent(historyComponent)
                    }

                    result.push(map)

                } catch (error) {
                    console.error("Failed to read map #" + i, error)
                }
            }
        } catch (error) {
            console.error("Failed to read saved maps", error)
            return null
        }
        
        return result
    }

    static write(maps: GameMap[]) {
        let buffer = new WriteBuffer()
        buffer.writeInt16(maps.length)
        let length = maps.length

        for(let i = 0; i < length; i++) {
            let bytes = pako.gzip(MapSerialization.toBuffer(maps[i]))

            maps[i].getComponent(GameMapSizeComponent).size = bytes.byteLength

            buffer.writeInt32(bytes.length)
            buffer.writeBytes(bytes)
        }

        window.localStorage.setItem("editor-maps", bytesToBase64(buffer.spitBuffer()))
    }
}