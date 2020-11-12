
const BinaryPacket = require("../../binarypacket")
const EntityModel = require("../../../entity/entitymodel")
const BinarySerializable = require("../../../serialization/binary/serializable")

class EntityCreatePacket extends BinaryPacket {
    static typeName() { return 11 }

    constructor(entities) {
        super();

        if(entities === undefined) {
            this.entities = []
        } else if(!Array.isArray(entities)) {
            this.entities = [entities]
        } else this.entities = entities
    }

    toBinary(encoder) {
        encoder.writeUint16(this.entities.length)

        for(let entity of this.entities) {
            BinarySerializable.serialize(entity.model, encoder)
        }
    }

    createEntities(callback) {
        let decoder = this.decoder
        let count = decoder.readUint16()

        for(let i = 0; i < count; i++) {
            let model = BinarySerializable.deserialize(decoder, EntityModel)
            if(model) callback(model)
        }
    }
}

BinaryPacket.register(EntityCreatePacket)
module.exports = EntityCreatePacket