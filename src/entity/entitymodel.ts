
import BinarySerializable, {Constructor} from '../serialization/binary/serializable';
import BinaryEncoder from "../serialization/binary/binaryencoder";
import BinaryDecoder from "../serialization/binary/binarydecoder";
import GameWorld from "../gameworld";
import AbstractEntity from "./abstractentity";

/**
 * Entity model. Describes entity position,
 * velocity and setAngle. Each entity type should
 * inherit this class.
 * This class used both on client and server
 * side. Can be updated dynamically through
 * binary serialization.
 */

class EntityModel implements BinarySerializable<typeof EntityModel> {

    static groupName = 5
    static typeName = 0

    /// Per-screen unique entity identifier
    public id = 0;

    /// Entity X coordinate
    public x = 0;

    /// Entity Y coordinate
    public y = 0;

    /// Entity X speed
    public dx = 0;

    /// Entity Y speed
    public dy = 0;

    /// Entity rotation
    public rotation = 0;

    /// Indicating if entity has died
    public dead = false

    public game: GameWorld
    public entity?: AbstractEntity

    constructor(game: GameWorld) {
        this.game = game
    }

    tick(dt: number): void {
        this.x += this.dx * dt
        this.y += this.dy * dt
    }

    toBinary(encoder: BinaryEncoder): void {
        encoder.writeUint32(this.id)
        this.encodeDynamicData(encoder)
    }

    encodeDynamicData(encoder: BinaryEncoder): void {
        encoder.writeFloat32(this.x)
        encoder.writeFloat32(this.y)
        encoder.writeFloat32(this.dx)
        encoder.writeFloat32(this.dy)
        encoder.writeFloat32(this.rotation)
    }

    decodeDynamicData(decoder: BinaryDecoder): void {
        this.x = decoder.readFloat32()
        this.y = decoder.readFloat32()
        this.dx = decoder.readFloat32()
        this.dy = decoder.readFloat32()
        this.rotation = decoder.readFloat32()
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {

        const entity = new this() as any as EntityModel

        entity.id = decoder.readUint32()
        entity.decodeDynamicData(decoder)

        return entity as any as T
    }
}

export default EntityModel;