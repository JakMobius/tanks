
const BinaryPacket = require("../binarypacket")

class EntityRemovePacket extends BinaryPacket {
    static typeName() { return 12 }

    constructor(entity) {
        super();

        this.entityId = entity ? entity.model.id : 0
    }

    toBinary(encoder) {
        encoder.writeUint32(this.entityId)
    }

    updateEntities(map) {
        this.entityId = this.decoder.readUint32()
        map.delete(this.entityId)
    }
}

BinaryPacket.register(EntityRemovePacket)
module.exports = EntityRemovePacket