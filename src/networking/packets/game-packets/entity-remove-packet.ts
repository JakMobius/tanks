
import BinaryPacket from '../../binary-packet';
import AbstractEntity from "../../../entity/abstract-entity";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import {BinarySerializer} from "../../../serialization/binary/serializable";
import AbstractWorld from "../../../abstract-world";

export default class EntityRemovePacket extends BinaryPacket {
	public entityId: number;

    static typeName = 12

    constructor(entity: AbstractEntity) {
        super();

        this.entityId = entity ? entity.model.id : 0
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint32(this.entityId)
    }

    updateEntities(world: AbstractWorld) {
        this.entityId = this.decoder.readUint32()
        world.removeEntity(world.entities.get(this.entityId))
    }
}

BinarySerializer.register(EntityRemovePacket)