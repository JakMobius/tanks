
import BinarySerializable, {Constructor} from '../serialization/binary/serializable';
import BinaryEncoder from "../serialization/binary/binary-encoder";
import BinaryDecoder from "../serialization/binary/binary-decoder";
import AbstractWorld from "../abstract-world";
import AbstractEntity from "./abstract-entity";
import * as Box2D from "../library/box2d"

/**
 * Entity model. Describes entity position,
 * velocity and setAngle. Each entity type should
 * inherit this class.
 * This class used both on client and server
 * side. Can be updated dynamically through
 * binary serialization.
 */

export type EntityModelType = {
    getId(): number,
    getMaximumHealth(): number
}

export default class EntityModel implements BinarySerializable<typeof EntityModel> {

    static groupName = 5
    static typeName = 0

    /// Per-screen unique entity identifier
    public id = 0;

    /// Indicating if entity has died
    public dead = false

    public health: number

    public game: AbstractWorld
    public entity?: AbstractEntity

    private body: Box2D.Body

    constructor() {
        this.setHealth((this.constructor as typeof EntityModel).getMaximumHealth())
    }

    tick(dt: number): void {

    }

    toBinary(encoder: BinaryEncoder): void {
        encoder.writeUint32(this.id)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {

        const model = new this() as any as EntityModel

        model.id = decoder.readUint32()

        return model as any as T
    }

    static getMaximumHealth() {
        return 10
    }

    initPhysics(world: Box2D.World) {
        throw new Error("Method not implemented")
    }

    destroyPhysics() {
        this.body.GetWorld().DestroyBody(this.body)
        this.body = null
    }

    setBody(body: Box2D.Body) {
        if(body) body.SetUserData(null)
        this.body = body
        body.SetUserData(this)
    }

    getBody() { return this.body }

    static getId(): number {
        return this.typeName
    }

    setHealth(health: number) {
        this.health = health
        const entity = this.entity
        if(!entity) return
        const world = entity.getWorld()
        if(!world) return
        world.emit("entity-health-change", entity)
    }

    physicsTick(physicsTick: number) {
        
    }
}