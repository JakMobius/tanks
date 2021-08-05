
import EffectModel from '../effect-model';
import {Constructor} from "../../serialization/binary/serializable";
import BinaryDecoder from "../../serialization/binary/binarydecoder";
import BinaryEncoder from "../../serialization/binary/binaryencoder";

export default class TankEffectModel extends EffectModel {

    // Identifier of the tank holding this effect
    tankId: number

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let model = super.fromBinary(decoder) as TankEffectModel
        model.tankId = decoder.readUint16()
        return model as any as T
    }

    toBinary(encoder: BinaryEncoder) {
        super.toBinary(encoder)
        encoder.writeUint16(this.tankId)
    }
}