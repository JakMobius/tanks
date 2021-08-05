
import BinaryPacket from '../../binary-packet';
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import {BinarySerializer} from "../../../serialization/binary/serializable";
import AbstractEntity from "../../../entity/abstract-entity";
import AbstractWorld from "../../../abstract-world";

export default class EntityLocationPacket extends BinaryPacket {
    public world: AbstractWorld

    static typeName = 4

    /**
     * Creates a packet that contains information about
     * location and speed of each entity on the map.
     * @param world World to read entities from
     */

    constructor(world: AbstractWorld) {
        super();

        this.world = world
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint16(this.world.entities.size)

        for (let [key, entity] of this.world.entities) {
            encoder.writeUint32(key)
            entity.encodeDynamicData(encoder)
        }
    }

    /**
     * Updates tank positions based on packet data.
     * @param world World to update entities
     */
    updateEntities(world: AbstractWorld) {
        if (!this.decoder) {
            throw new Error("This packet is not valid anymore: The decoder buffer has been reused.")
        }

        this.decoder.save()

        let count = this.decoder.readUint16()
        while (count--) {
            let key = this.decoder.readUint32()

            let entity = world.entities.get(key)
            entity.decodeDynamicData(this.decoder)
        }

        this.decoder.restore()
    }
}

BinarySerializer.register(EntityLocationPacket)