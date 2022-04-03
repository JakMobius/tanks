
import {Constructor} from '../serialization/binary/serializable';
import BinaryEncoder from "../serialization/binary/binary-encoder";
import BinaryDecoder from "../serialization/binary/binary-decoder";
import AbstractWorld from "../abstract-world";
import AbstractEntity from "./abstract-entity";
import Entity from "../utils/ecs/entity";
import PhysicalHostComponent from "../physics-world";
import PositionComponent from "./position-component";

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

export default class EntityModel extends Entity {

    static groupName = 5
    static typeName = 0

    /// Per-screen unique entity identifier
    public id = 0;

    /// Indicating if entity has died
    public dead = false

    public health: number

    public game: AbstractWorld
    public entity?: AbstractEntity

    constructor() {
        super()

        this.addComponent(new PositionComponent())
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

    initPhysics(world: PhysicalHostComponent) {
        throw new Error("Method not implemented")
    }

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
}