
import BinaryPacket from '../../binarypacket';

class EntityListPacket extends BinaryPacket {
	public entities: any;
	public entitySize: any;

    static typeName() { return 10 }

    /**
     * @param entities {Map<Number, AbstractEntity>}
     */
    constructor(entities) {
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

    toBinary(encoder) {

        encoder.writeUint16(this.entitySize)

        for(let entity of this.entities.values()) {
            encoder.writeUint32(entity.model.id)
            entity.model.encodeDynamicData(encoder)
        }
    }

    /**
     * @param map {Map<Number, AbstractEntity>}
     */
    updateEntities(map) {
        let i = this.decoder.readUint16()

        while(i--) {
            let key = this.decoder.readUint32()

            if(map.has(key)) {
                map.get(key).model.decodeDynamicData(this.decoder)
            }
        }
    }
}

BinaryPacket.register(EntityListPacket)
export default EntityListPacket;