import BinaryPacket from '../../binary-packet';
import {BinarySerializer} from "src/serialization/binary/serializable";
import ReadBuffer from "src/serialization/binary/read-buffer";
import WriteBuffer from "src/serialization/binary/write-buffer";
import {Constructor} from "src/utils/constructor";

export enum PlayerActionType {
    selfDestruct,
    selfDestructCancel,
    flagDrop
}

export default class PlayerActionPacket extends BinaryPacket {
    static typeName = 9
    action: PlayerActionType

    constructor(action: PlayerActionType) {
        super();
        this.action = action
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeInt16(this.action)
    }
    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T { return new this(decoder.readInt16()) }
}

BinarySerializer.register(PlayerActionPacket)