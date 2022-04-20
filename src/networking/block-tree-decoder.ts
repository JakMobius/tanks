import ReadBuffer from "../serialization/binary/read-buffer";
import BinaryBlockCoder from "../serialization/binary/parsers/binary-block-coder";

export default class BlockTreeDecoder {

    static forEachNodeChildren(buffer: ReadBuffer, callback: (buffer: ReadBuffer, size: number) => void) {
        BinaryBlockCoder.decodeBlock(buffer, (buffer, size) => {
            let end = buffer.offset + size
            while(buffer.offset < end) {
                BinaryBlockCoder.decodeBlock(buffer, (buffer, size) => {
                    callback(buffer, size)
                })
            }
        })
    }
}