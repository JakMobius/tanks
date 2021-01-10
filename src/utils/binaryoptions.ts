/**
 * More reliable for serializing long-lasting or
 * large and scalable data structures.
 */
import BinaryEncoder from "../serialization/binary/binaryencoder";
import BinaryDecoder from "../serialization/binary/binarydecoder";

type Packer = ((encoder: BinaryEncoder, options: any) => void)
type Unpacker = ((decoder: BinaryDecoder, options: any) => void)
type Decision = ((object: any) => boolean)

export class FlagHandler {

    id: number;
    unpacker: Unpacker;
    packer: Packer;
    decision: Decision;

    constructor(id: number) {
        this.id = id
        this.unpacker = null
        this.packer = null
        this.decision = null
    }

    setUnpacker(unpacker: Unpacker): FlagHandler {
        this.unpacker = unpacker
        return this
    }

    setPacker(packer: Packer): FlagHandler {
        this.packer = packer
        return this
    }

    packDecision(decision: Decision): FlagHandler {
        this.decision = decision
        return this
    }

}

class BinaryOptions {

    /**
     * Flag handler map
     */
    public flags = new Map<number, FlagHandler>()
    public trimFlagIdentifier = false

    constructor() {
    }

    addFlagHandler(handler: FlagHandler) {
        this.flags.set(handler.id, handler)
    }

    convertBinary(decoder: BinaryDecoder, options?: any) {
        let flags: number

        if (this.trimFlagIdentifier) flags = decoder.readUint8()
        else flags = decoder.readUint16()

        options = options || {}

        while (flags--) {
            let flag
            if (this.trimFlagIdentifier) flag = decoder.readUint8()
            else flag = decoder.readUint16()

            if (this.flags.has(flag)) {
                let handler = this.flags.get(flag)
                handler.unpacker(decoder, options)
            }
        }

        return options
    }

    convertOptions(encoder: BinaryEncoder, options: any, flags?: number[]) {

        if (!options) options = {}

        let count = 0

        for (let [flag, handler] of this.flags.entries()) {
            if (flags && flags.indexOf(flag) === -1) continue
            if (handler.decision && !handler.decision(options)) continue

            count++
        }

        if (this.trimFlagIdentifier) encoder.writeUint8(count)
        else encoder.writeUint16(count)

        for (let [flag, handler] of this.flags.entries()) {
            if (flags && flags.indexOf(flag) === -1) continue
            if (handler.decision && !handler.decision(options)) continue

            if (this.trimFlagIdentifier) encoder.writeUint8(flag)
            else encoder.writeUint16(flag)

            handler.packer(encoder, options)
        }

        return options
    }
}

export default BinaryOptions;