
import BinarySerializable, {BinarySerializer, Constructor} from '../serialization/binary/serializable';
import BinaryEncoder from "../serialization/binary/binary-encoder";
import BinaryDecoder from "../serialization/binary/binary-decoder";

export interface EffectModelConfig {
    id?: number
}

/**
 * This class represents an effect model, which contains all necessary
 * data to create an side-specific effect class instance
 */
export default class EffectModel implements BinarySerializable<typeof EffectModel> {

    private static globalId = 0

    // Unique effect identifier
    id: number

    constructor(options?: EffectModelConfig) {
        options = Object.assign({

        }, options)

        if (options.id === undefined) {
            this.id = EffectModel.globalId++
        } else {
            this.id = options.id
        }
    }

    static groupName = 2
    static typeName = 0

    toBinary(encoder: BinaryEncoder) {
        encoder.writeFloat64(this.id)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        return new this({
            id: decoder.readFloat64()
        }) as T
    }

    static register(Model: typeof EffectModel) {
        BinarySerializer.register(Model)
    }
}