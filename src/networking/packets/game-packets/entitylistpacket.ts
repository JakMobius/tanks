
import BinaryPacket from '../../binarypacket';
import {BinaryDecodable, BinarySerializer} from "../../../serialization/binary/serializable";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import AbstractEntity from "../../../entity/abstractentity";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";

class EntityListPacket extends BinaryPacket {

    // protected static fieldCodingDeclarator = new Map([
    //     ["entities", {
    //         type: "map",
    //         key: "Uint32",
    //         value: {
    //             read: (entity: AbstractEntity, encoder: BinaryEncoder) => entity.model.encodeDynamicData(encoder),
    //             write: (entity: AbstractEntity, decoder: BinaryDecoder) => entity.model.decodeDynamicData(decoder)
    //         }
    //     }]
    // ])

	public entities: Map<Number, AbstractEntity>;
	public entityCount: number;

    static typeName = 10

    constructor(entities: Map<Number, AbstractEntity>) {
        super();
        this.entities = entities
        this.entityCount = 0

        if(this.entities) this.entityCount = this.entities.size
    }

    shouldSend() {
        return this.entityCount > 0
    }

    toBinary(encoder: BinaryEncoder) {

        encoder.writeUint16(this.entityCount)

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