
import BinarySerializable from '../serialization/binary/serializable';

/**
 * Entity model. Describes entity position,
 * velocity and angle. Each entity type should
 * inherit this class.
 * This class used both on client and server
 * side. Can be updated dynamically through
 * binary serialization.
 */

class EntityModel extends BinarySerializable {

    static groupName() { return 5 }

    /**
     * Per-screen unique entity identifier
     * @type number
     */
    id;

    /**
     * Entity X coordinate
     * @type number
     */
    x = 0;

    /**
     * Entity Y coordinate
     * @type number
     */
    y = 0;

    /**
     * Entity X speed
     * @type number
     */
    dx = 0;

    /**
     * Entity Y speed
     * @type number
     */
    dy = 0;

    /**
     * Entity rotation
     * @type number
     */
    rotation = 0;

    /**
     * Indicating if entity has died
     * @type {boolean}
     */
    dead = false

    constructor() {
        super();

        this.id = 0
        this.x = 0
        this.y = 0
        this.dx = 0
        this.dy = 0
        this.rotation = 0
    }

    tick(dt) {
        this.x += this.dx * dt
        this.y += this.dy * dt
    }

    toBinary(encoder) {
        encoder.writeUint32(this.id)
        this.encodeDynamicData(encoder)
    }

    encodeDynamicData(encoder) {
        encoder.writeFloat32(this.x)
        encoder.writeFloat32(this.y)
        encoder.writeFloat32(this.dx)
        encoder.writeFloat32(this.dy)
        encoder.writeFloat32(this.rotation)
    }

    decodeDynamicData(decoder) {
        this.x = decoder.readFloat32()
        this.y = decoder.readFloat32()
        this.dx = decoder.readFloat32()
        this.dy = decoder.readFloat32()
        this.rotation = decoder.readFloat32()
    }

    static fromBinary(decoder) {

        const entity = new this()

        entity.id = decoder.readUint32()
        entity.decodeDynamicData(decoder)

        return entity
    }
}

export default EntityModel;