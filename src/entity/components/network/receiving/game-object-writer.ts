import ObjectWriter from "../../../../serialization/binary/parsers/object-writer";
import Transmitter from "../transmitting/transmitter";
import Entity from "../../../../utils/ecs/entity";
import WriteBuffer from "../../../../serialization/binary/write-buffer";
import {ObjectTypeIndices} from "../../../../serialization/binary/parsers/object-type-indices";

export default class GameObjectWriter extends ObjectWriter {

    private currentTransmitter: Transmitter | null = null
    public static instance = new GameObjectWriter()

    writeWithTransmitter(object: any, transmitter: Transmitter): void {
        this.currentTransmitter = transmitter
        this.write(object, transmitter.set.receivingEnd.buffer)
        this.currentTransmitter = null
    }

    protected writeCustomObject(object: any, buffer: WriteBuffer): void {
        if(!(object instanceof Entity)) {
            throw new Error("Cannot encode " + object.constructor.name + " with GameObjectWriter. Only Entity objects are supported")
        }

        if(!this.currentTransmitter) {
            throw new Error("Transmitter object not set. Please, use writeWithTransmitter instead of write")
        }

        this.currentTransmitter.pointToEntity(object)
    }

    static getEntitiesFromObject(object: any, destinationArray: Entity[]): void {
        if(object === null) {
            return
        } else if(object instanceof Array) {
            for(let i = 0; i < object.length; i++) {
                this.getEntitiesFromObject(object[i], destinationArray)
            }
        } else if(object instanceof Object) {
            let constructor = object.constructor
            if(constructor === Object) {
                for (let value of Object.values(object)) {
                    this.getEntitiesFromObject(value, destinationArray)
                }
            } else if(constructor === Entity) {
                destinationArray.push(object)
            }
        }
    }
}