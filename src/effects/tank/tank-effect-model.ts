
import EffectModel from '../effect-model';
import {Constructor} from "../../serialization/binary/serializable";
import BinaryDecoder from "../../legacy/serialization-v0001/binary/binary-decoder";
import BinaryEncoder from "../../legacy/serialization-v0001/binary/binary-encoder";
import ReadBuffer from "../../serialization/binary/read-buffer";
import WriteBuffer from "../../serialization/binary/write-buffer";

export default class TankEffectModel extends EffectModel {

    // Identifier of the tank holding this effect
    tankId: number

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let model = super.fromBinary(decoder) as TankEffectModel
        model.tankId = decoder.readUint16()
        return model as any as T
    }

    toBinary(encoder: WriteBuffer) {
        super.toBinary(encoder)
        encoder.writeUint16(this.tankId)
    }
}