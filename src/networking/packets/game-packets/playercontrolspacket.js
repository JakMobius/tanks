
const TankControls = require("../../../tanks/controls/tankcontrols")
const BinaryPacket = require("../../binarypacket")

class PlayerControlsPacket extends BinaryPacket {

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
module.exports = PlayerControlsPacket