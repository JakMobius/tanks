import BinaryPacket from '../../binary-packet';
import EntityModel from '../../../entity/entity-model';
import {BinarySerializer} from '../../../serialization/binary/serializable';
import AbstractEntity from "../../../entity/abstract-entity";
import WriteBuffer from "../../../serialization/binary/write-buffer";
import EntityDataDecoder from "../../../client/entity/entity-data-decoder";
import EntityDataEncoder from "../../../server/entity/entity-data-encoder";

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

    toBinary(encoder: WriteBuffer): void {
        encoder.writeUint16(this.entities.length)

        for(let entity of this.entities) {
            BinarySerializer.serialize(entity.model, encoder)
            entity.model.getComponent(EntityDataEncoder).encodeInitialData(encoder)
        }
    }

    createEntities<T extends AbstractEntity>(factory: (model: EntityModel) => T) {
        let decoder = this.decoder
        let count = decoder.readUint16()

        for(let i = 0; i < count; i++) {
            let model = BinarySerializer.deserialize(decoder, EntityModel)
            let entity = factory(model)
            entity.model.getComponent(EntityDataDecoder).decodeInitialData(decoder)
        }
    }
}

BinarySerializer.register(EntityCreatePacket)