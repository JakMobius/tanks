
import BinaryPacket from '../../binarypacket';
import EntityModel from '../../../entity/entitymodel';
import BinarySerializable, {BinarySerializer} from '../../../serialization/binary/serializable';
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import AbstractEntity from "../../../entity/abstractentity";

class EntityCreatePacket extends BinaryPacket {
	public entities: any;

    static typeName = 11

    constructor(entities: undefined | AbstractEntity | Array<AbstractEntity>) {
        super();

        if(entities === undefined) {
            this.entities = []
        } else if(!Array.isArray(entities)) {
            this.entities = [entities]
        } else this.entities = entities
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint16(this.entities.length)

        for(let entity of this.entities) {
            BinarySerializer.serialize(entity.model, encoder)
        }
    }

    createEntities(callback: (model: EntityModel) => void) {
        let decoder = this.decoder
        let count = decoder.readUint16()

        for(let i = 0; i < count; i++) {
            let model = BinarySerializer.deserialize(decoder, EntityModel)
            if(model) callback(model)
        }
    }
}

BinarySerializer.register(EntityCreatePacket)
export default EntityCreatePacket;