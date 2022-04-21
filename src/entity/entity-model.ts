import {Constructor} from '../serialization/binary/serializable';
import AbstractEntity from "./abstract-entity";
import Entity from "../utils/ecs/entity";
import PhysicalHostComponent from "../physiсal-world-component";
import TransformComponent from "./components/transform-component";
import HealthComponent from "./components/health-component";
import ReadBuffer from "../serialization/binary/read-buffer";
import WriteBuffer from "../serialization/binary/write-buffer";
import EffectHost from "../effects/effect-host";
import EffectReceiver from "./components/network/effect/effect-receiver";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";

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
    static Types = new Map<number, (entity: EntityModel) => void>()

    static groupName = 5
    static typeName = 0

    /// Per-screen unique entity identifier
    public id = 0;

    /// Indicating if entity has died
    public dead = false

    public entity?: AbstractEntity

    private parentEventHandler = new BasicEventHandlerSet()

    constructor() {
        super()

        this.addComponent(new TransformComponent())
        this.addComponent(new HealthComponent())
        this.addComponent(new EffectHost())

        this.getComponent(HealthComponent).setHealth((this.constructor as typeof EntityModel).getMaximumHealth())

        this.parentEventHandler.on("tick", (dt) => this.tick(dt))

        this.on("attached-to-parent", (child, parent) => {
            if(child == this) this.parentEventHandler.setTarget(parent)
        });
    }

    tick(dt: number): void {
        this.emit("tick", dt)
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeUint32(this.id)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        const model = new this() as any as EntityModel

        model.id = decoder.readUint32()

        return model as any as T
    }

    static getMaximumHealth() {
        return 10
    }

    initPhysics(world: PhysicalHostComponent) {
        // throw new Error("Method not implemented")
    }

    static getId(): number {
        return this.typeName
    }
}