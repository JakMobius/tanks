
import BinaryPacket from '../../binarypacket';
import {BinarySerializer} from "../../../serialization/binary/serializable";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import AbstractEntity from "../../../entity/abstractentity";

class EntityListPacket extends BinaryPacket {
	public entities: any;
	public entitySize: any;

    static typeName = 10

    constructor(entities: Map<Number, AbstractEntity>) {
        super();
        this.entities = entities
        this.entitySize = 0

        if(this.entities) for(let entity of this.entities) {
            this.entitySize++
        }
    }

    shouldSend() {
        return this.entitySize > 0
    }

    toBinary(encoder: BinaryEncoder) {

        encoder.writeUint16(this.entitySize)

        for(let entity of this.entities.values()) {
            encoder.writeUint32(entity.model.id)
            entity.model.encodeDynamicData(encoder)
        }
    }

    updateEntities(map: Map<Number, AbstractEntity>): void {
        let i = this.decoder.readUint16()

        while(i--) {
            let key = this.decoder.readUint32()

            if(map.has(key)) {
                map.get(key).model.decodeDynamicData(this.decoder)
            }
        }
    }
}

BinarySerializer.register(EntityListPacket)
export default EntityListPacket;