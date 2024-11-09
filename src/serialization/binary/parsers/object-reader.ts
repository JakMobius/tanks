import {ObjectTypeIndices} from "./object-type-indices";
import ReadBuffer from "../read-buffer";

export default class ObjectReader {
    read(buffer: ReadBuffer): any {
        let type = buffer.readUint8()
        if (type === ObjectTypeIndices.string) {
            return buffer.readString()
        } else if (type === ObjectTypeIndices.number) {
            return buffer.readFloat64()
        } else if (type === ObjectTypeIndices.true) {
            return true
        } else if (type === ObjectTypeIndices.false) {
            return false
        } else if (type === ObjectTypeIndices.null) {
            return null
        } else if (type === ObjectTypeIndices.array) {
            let length = buffer.readUint32()
            let array = new Array(length)
            for (let i = 0; i < length; i++) {
                array[i] = this.read(buffer)
            }
            return array
        } else if (type === ObjectTypeIndices.object) {
            let length = buffer.readUint8()

            // Use Object.create(null) here to avoid prototype pollution
            let object: any = Object.create(null)
            for (let i = 0; i < length; i++) {
                let key = buffer.readString()
                object[key] = this.read(buffer)
            }
            return object
        } else if (type === ObjectTypeIndices.undefined) {
            return undefined
        } else if (type === ObjectTypeIndices.custom) {
            return this.readCustomObject(buffer)
        }  else {
            throw new Error("Unknown type")
        }
    }

    protected readCustomObject(buffer: ReadBuffer) {
        throw new Error("Cannot read custom object")
    }
}