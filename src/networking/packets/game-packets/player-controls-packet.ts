
import TankControls from '../../../controls/tank-controls';
import BinaryPacket from '../../binary-packet';
import BinaryEncoder from "../../../serialization/binary/binary-encoder";
import {BinarySerializer} from "../../../serialization/binary/serializable";

export default class PlayerControlsPacket extends BinaryPacket {
	public controls: TankControls;
    static typeName = 6

    constructor(controls: TankControls) {
        super();
        this.controls = controls
    }

    toBinary(encoder: BinaryEncoder) {
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