
import BinaryPacket from '../../binarypacket';
import AbstractEntity from "../../../entity/abstractentity";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import {BinarySerializer} from "../../../serialization/binary/serializable";

class EntityRemovePacket extends BinaryPacket {
	public entityId: number;

    static typeName = 12

    constructor(entity: AbstractEntity) {
        super();

        this.entityId = entity ? entity.model.id : 0
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint32(this.entityId)
    }

    updateEntities(map: Map<number, AbstractEntity>) {
        this.entityId = this.decoder.readUint32()
        map.delete(this.entityId)
    }
}

BinarySerializer.register(EntityRemovePacket)
export default EntityRemovePacket;