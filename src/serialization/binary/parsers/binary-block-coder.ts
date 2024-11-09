/**
 * More reliable for serializing long-lasting or
 * large and scalable data structures.
 */

import WriteBuffer from "../write-buffer";
import ReadBuffer from "../read-buffer";

export default class BinaryBlockCoder {

    static decodeBlock(decoder: ReadBuffer, lambda: (decoder: ReadBuffer, size: number) => void) {
        let savedPosition = decoder.offset
        let size = decoder.readUint32()

        if(size === 0) {
            throw new Error("Zero-size blocks are invalid")
        }

        if(savedPosition + size > decoder.buffer.byteLength) {
            throw new Error("Oversize blocks are invalid")
        }

        lambda(decoder, size + savedPosition - decoder.offset)

        decoder.offset = savedPosition + size
    }

    static encodeBlock(encoder: WriteBuffer, lambda: (encoder: WriteBuffer) => void) {
        let startPosition = encoder.offset
        encoder.writeUint32(-1)

        lambda(encoder)

        let endPosition = encoder.offset
        encoder.offset = startPosition
        encoder.writeUint32(endPosition - startPosition)
        encoder.offset = endPosition
    }

    static skipBlock(decoder: ReadBuffer)  {
        return this.decodeBlock(decoder, () => {})
    }
}
