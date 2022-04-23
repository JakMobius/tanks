
import AbstractEntity from "./abstract-entity";
import Entity from "../utils/ecs/entity";
import PhysicalHostComponent from "../physiсal-world-component";
import TransformComponent from "./components/transform-component";
import HealthComponent from "./components/health-component";
import EffectHost from "../effects/effect-host";
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

        this.on("removed-from-parent", (child, parent) => {
            if(child == this) this.parentEventHandler.setTarget(null)
        })
    }

    tick(dt: number): void {
        this.emit("tick", dt)
    }

    static getMaximumHealth() {
        return 10
    }
}