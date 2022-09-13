import WriteBuffer from "../write-buffer";
import {ObjectTypeIndices} from "./object-type-indices";

export default class ObjectWriter {
    write(object: any, buffer: WriteBuffer) {
        let type = typeof object
        if(type === "undefined") {
            buffer.writeUint8(ObjectTypeIndices.undefined)
        } else if(type === "string") {
            buffer.writeUint8(ObjectTypeIndices.string)
            buffer.writeString(object)
        } else if(type === "number") {
            buffer.writeUint8(ObjectTypeIndices.number)
            buffer.writeFloat64(object)
        } else if(type === "boolean") {
            buffer.writeUint8(object ? ObjectTypeIndices.true : ObjectTypeIndices.false)
        } else if(object === null) {
            buffer.writeUint8(ObjectTypeIndices.null)
        } else if(object instanceof Array) {
            buffer.writeUint8(ObjectTypeIndices.array)
            buffer.writeUint32(object.length)
            for(let i = 0; i < object.length; i++) {
                this.write(object[i], buffer)
            }
        } else if(object instanceof Object) {
            let constructor = object.constructor
            if(constructor === Object) {
                buffer.writeUint8(ObjectTypeIndices.object)
                let keys = Object.keys(object)
                buffer.writeUint8(keys.length)
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i]
                    buffer.writeString(key)
                    this.write(object[key], buffer)
                }
            } else {
                buffer.writeUint8(ObjectTypeIndices.custom)
                this.writeCustomObject(object, buffer)
            }
        } else {
            throw new Error("Unknown type")
        }
    }

    protected writeCustomObject(object: any, buffer: WriteBuffer) {
        throw new Error("Unknown object constructor: " + object.constructor.name)
    }
}