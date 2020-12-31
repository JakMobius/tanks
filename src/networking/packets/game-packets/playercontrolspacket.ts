
import TankControls from '../../../tanks/controls/tankcontrols';
import BinaryPacket from '../../binarypacket';

class PlayerControlsPacket extends BinaryPacket {
	public controls: any;

    static typeName() { return 6 }

    /**
     * @param { TankControls } controls
     */
    constructor(controls) {
        super();
        this.controls = controls
    }

    toBinary(encoder) {
        this.controls.toBinary(encoder)
    }

    /**
     * Update specified tank controls
     * @param { TankControls } controls
     */
    updateControls(controls) {
        controls.updateState(this.decoder)
    }
}

BinaryPacket.register(PlayerControlsPacket)
export default PlayerControlsPacket;