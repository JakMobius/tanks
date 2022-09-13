import TankControls from '../../../controls/tank-controls';
import BinaryPacket from '../../binary-packet';
import {BinarySerializer} from "src/serialization/binary/serializable";
import WriteBuffer from "src/serialization/binary/write-buffer";

export default class PlayerControlsPacket extends BinaryPacket {
	public controls: TankControls;
    static typeName = 6

    constructor(controls: TankControls) {
        super();
        this.controls = controls
    }

    toBinary(encoder: WriteBuffer): void {
        this.controls.toBinary(encoder)
    }

    /**
     * Update specified tank controls
     */
    updateControls(controls: TankControls): void {
        controls.updateState(this.decoder)
    }
}

BinarySerializer.register(PlayerControlsPacket)