import BinaryPacket from "../../binary-packet";
import AbstractEntity from "../../../entity/abstract-entity";
import BinaryEncoder from "../../../serialization/binary/binary-encoder";
import AbstractWorld from "../../../abstract-world";
import {BinarySerializer} from "../../../serialization/binary/serializable";
import HealthComponent from "../../../entity/health-component";

export default class EntityHealthPacket extends BinaryPacket {

    public static typeName = 21
    private readonly entities: Set<AbstractEntity>

    constructor(entities: Set<AbstractEntity>) {
        super()
        this.entities = entities
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint32(this.entities.size)
        for(let entity of this.entities) {
            encoder.writeUint32(entity.model.id)
            encoder.writeFloat32(entity.model.getComponent(HealthComponent).getHealth())
        }
    }

    updateEntities(world: AbstractWorld) {
        const count = this.decoder.readUint32()
        for(let i = 0; i < count; i++) {
            const id = this.decoder.readUint32()
            const health = this.decoder.readFloat32()

            world.entities.get(id).model.getComponent(HealthComponent).setHealth(health)
        }
    }

}

BinarySerializer.register(EntityHealthPacket)