
import BinaryPacket from '../../binary-packet';
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import {BinarySerializer} from "../../../serialization/binary/serializable";
import AbstractWorld from "../../../abstract-world";

export default class WorldPlayerControlsPacket extends BinaryPacket {
    private world: AbstractWorld;
    static typeName = 20

    constructor(world: AbstractWorld) {
        super();
        this.world = world
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint16(this.world.players.size)
        for(let [id, player] of this.world.players.entries()) {
            encoder.writeUint32(id)
            player.tank.model.controls.toBinary(encoder)
        }
    }

    updateControls(world: AbstractWorld): void {
        const count = this.decoder.readUint16()
        for(let i = 0; i < count; i++) {
            const id = this.decoder.readUint32()
            let player = world.players.get(id)
            player.tank.model.controls.updateState(this.decoder)
        }
    }
}

BinarySerializer.register(WorldPlayerControlsPacket)