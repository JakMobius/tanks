import BinaryPacket from '../../binary-packet';
import {BinarySerializer} from "../../../serialization/binary/serializable";
import AbstractWorld from "../../../abstract-world";
import TankControls from "../../../controls/tank-controls";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class WorldPlayerControlsPacket extends BinaryPacket {
    private world: AbstractWorld;
    static typeName = 20

    constructor(world: AbstractWorld) {
        super();
        this.world = world
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeUint16(this.world.players.size)
        for(let [id, player] of this.world.players.entries()) {
            encoder.writeUint32(id)
            // TODO: This is also kind of wrong.
            // TankControls should rather add itself in
            // "dynamically-updated data" registry, and
            // write its data in the packet by his own.
            player.tank.model.getComponent(TankControls).toBinary(encoder)
        }
    }

    updateControls(world: AbstractWorld): void {
        const count = this.decoder.readUint16()
        for(let i = 0; i < count; i++) {
            const id = this.decoder.readUint32()
            let player = world.players.get(id)
            player.tank.model.getComponent(TankControls).updateState(this.decoder)
        }
    }
}

BinarySerializer.register(WorldPlayerControlsPacket)