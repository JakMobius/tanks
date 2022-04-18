import BinaryPacket from '../../binary-packet';
import AbstractEntity from "../../../entity/abstract-entity";
import {BinarySerializer} from "../../../serialization/binary/serializable";
import AbstractWorld from "../../../abstract-world";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class EntityRemovePacket extends BinaryPacket {
	public entityId: number;

    static typeName = 12

    constructor(entity: AbstractEntity) {
        super();

        this.entityId = entity ? entity.model.id : 0
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeUint32(this.entityId)
    }

    updateEntities(world: AbstractWorld) {
        this.entityId = this.decoder.readUint32()
        world.removeEntity(world.entities.get(this.entityId))
    }
}

BinarySerializer.register(EntityRemovePacket)