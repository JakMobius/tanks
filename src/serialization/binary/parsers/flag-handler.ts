import WriteBuffer from "../write-buffer";
import ReadBuffer from "../read-buffer";

export type Packer = ((encoder: WriteBuffer, options: any) => void)
export type Unpacker = ((decoder: ReadBuffer, options: any) => void)
export type Decision = ((object: any) => boolean)

export default class FlagHandler {
    unpacker: Unpacker;
    packer: Packer;
    decision: Decision;

    constructor() {
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