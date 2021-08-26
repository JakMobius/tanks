
import BinaryPacket from '../../binary-packet';
import EntityModel from '../../../entity/entity-model';
import BinarySerializable, {BinarySerializer} from '../../../serialization/binary/serializable';
import BinaryEncoder from "../../../serialization/binary/binary-encoder";
import AbstractEntity from "../../../entity/abstract-entity";
import BulletModel from "../../../entity/bullets/bullet-model";

export default class EntityCreatePacket extends BinaryPacket {
	public entities: AbstractEntity[];

    static typeName = 11

    constructor(entities: undefined | AbstractEntity | AbstractEntity[]) {
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
            entity.encodeInitialData(encoder)
        }
    }

    createEntities<T extends AbstractEntity>(factory: (model: EntityModel) => T): T[] {
        let decoder = this.decoder
        let count = decoder.readUint16()
        let result = []

        for(let i = 0; i < count; i++) {
            let model = BinarySerializer.deserialize(decoder, EntityModel)
            let entity = factory(model)
            entity.decodeInitialData(decoder)
            result.push(entity)
        }

        return result
    }
}

BinarySerializer.register(EntityCreatePacket)