import * as Box2D from "@box2d/core";
import PhysicalComponent from "src/entity/components/physics-component";
import Entity from "src/utils/ecs/entity";
import GameWorldContactListener from "src/contact-listener";
import GameWorldContactFilter from "src/contact-filter";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import EntityContextProvider from "src/utils/ecs/entity-context-provider";

export interface PhysicalHostComponentConfig {
    gravity?: Box2D.XY
    physicsTick: number;
    iterations: Box2D.b2StepConfig;
}

export default class PhysicalHostComponent extends EventHandlerComponent {

    physicalComponents = new Set<PhysicalComponent>()

    public world: Box2D.b2World
    public physicsTick: number
    public iterations: Box2D.b2StepConfig
    public worldTicks: number = 0
    public worldTicksModulo: number = 65536

    contactListener: GameWorldContactListener
    contactFilter: GameWorldContactFilter
    contextProvider = new EntityContextProvider()
        .setAddHandler(entity => entity.emit("physical-host-attached", this))
        .setRemoveHandler(entity => entity.emit("physical-host-detached", this))

    constructor(config: PhysicalHostComponentConfig) {
        super()
        this.physicsTick = config.physicsTick
        this.iterations = config.iterations

        this.world = Box2D.b2World.Create(config.gravity ?? {x: 0, y: 0})

        this.setupContactListener()
        this.setupContactFilter()
    }

    beforePhysics() {
        for(let component of this.physicalComponents) {
            component.beforePhysics();
        }
    }

    afterPhysics(timeRemaining: number) {
        for(let component of this.physicalComponents) {
            component.afterPhysics(timeRemaining);
        }
    }

    tickPhysics() {
        this.world.ClearForces()
        for(let component of this.physicalComponents) {
            component.onPhysicsTick(this.physicsTick);
        }

        this.worldTicks = (this.worldTicks + 1) % this.worldTicksModulo

        if(this.iterations.positionIterations > 0 && this.iterations.velocityIterations > 0 && this.physicsTick > 0) {
            this.world.Step(this.physicsTick, this.iterations);
        }
    }

    onAttach(entity: Entity) {
        super.onAttach(entity)
        this.entity = entity;
        this.contextProvider.setEntity(this.entity)
    }

    onDetach() {
        super.onDetach()
        this.contextProvider.setEntity(null)
        this.entity = null
    }

    registerComponent(component: PhysicalComponent) {
        this.physicalComponents.add(component)
    }

    unregisterComponent(component: PhysicalComponent) {
        this.physicalComponents.delete(component)
    }

    protected setupContactListener() {
        this.contactListener = new GameWorldContactListener()
        this.world.SetContactListener(this.contactListener)
    }

    protected setupContactFilter() {
        this.contactFilter = new GameWorldContactFilter()
        this.world.SetContactFilter(this.contactFilter)
    }
}