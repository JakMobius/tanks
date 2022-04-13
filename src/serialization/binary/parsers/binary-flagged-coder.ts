import FlagHandler from "./flag-handler";
import ReadBuffer from "../read-buffer";
import WriteBuffer from "../write-buffer";
import BinaryBlockCoder from "./binary-block-coder";

export default class BinaryFlaggedCoder {
    public flags = new Map<number, FlagHandler>()

    constructor() {}

    addFlagHandler(id: number, handler: FlagHandler) {
        this.flags.set(id, handler)
    }

    blockToObject(decoder: ReadBuffer, size: number, options: any) {
        let end = decoder.offset + size
        while (decoder.offset < end) {
            BinaryBlockCoder.decodeBlock(decoder, () => {
                let flag = decoder.readUint16()

                if (this.flags.has(flag)) {
                    let handler = this.flags.get(flag)
                    handler.unpacker(decoder, options)
                }
            })
        }
    }

    bufferToObject(decoder: ReadBuffer, options?: any) {
        options = options || {}

        BinaryBlockCoder.decodeBlock(decoder, (decoder, size) => {
            this.blockToObject(decoder, size, options)
        });

        return options
    }

    objectToBlock(encoder: WriteBuffer, options: any) {
        for (let [flag, handler] of this.flags.entries()) {
            if (handler.decision && !handler.decision(options)) continue

            BinaryBlockCoder.encodeBlock(encoder, () => {
                encoder.writeUint16(flag)
                handler.packer(encoder, options)
            })
        }
    }

    objectToBuffer(encoder: WriteBuffer, options: any) {
        BinaryBlockCoder.encodeBlock(encoder, () => {
            this.objectToBlock(encoder, options)
        })
    }
}