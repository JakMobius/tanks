import BinarySerializable, {BinarySerializableStatic} from "./binary/serializable";
import {Constructor} from "src/utils/constructor";

export default class BinarySerializationGroup {
    map = new Map<number, BinarySerializableStatic<any>>();

    constructor() {

    }

    register(clazz: BinarySerializableStatic<any>): void {
        if(this.map.has(clazz.typeName)) {
            throw new Error(`Type name '${clazz.typeName}' is already registered in this group.`)
        }

        this.map.set(clazz.typeName, clazz);
    }

    get<C extends (Constructor<BinarySerializable<C>> & BinarySerializableStatic<C>)>(type: number): BinarySerializableStatic<C> | undefined {
        return this.map.get(type);
    }
}