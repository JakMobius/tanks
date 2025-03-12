import * as Box2D from "@box2d/core";
import PhysicalComponent from "src/entity/components/physics-component";
import Entity from "src/utils/ecs/entity";
import GameWorldContactListener from "src/contact-listener";
import GameWorldContactFilter from "src/contact-filter";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import EntityContextProvider from "src/utils/ecs/entity-context-provider";
import AdapterLoop from "src/utils/loop/adapter-loop";

export default class PhysicalHostComponent extends EventHandlerComponent {

    physicalComponents = new Set<PhysicalComponent>()

    public world: Box2D.b2World
    public physicsTick: number = 0.002
    public iterations: Box2D.b2StepConfig = { positionIterations: 1, velocityIterations: 1 }
    public worldTicks: number = 0
    public worldTicksModulo: number = 65536
    public loop: AdapterLoop

    contactListener: GameWorldContactListener
    contactFilter: GameWorldContactFilter
    contextProvider = new EntityContextProvider()
        .setAddHandler(entity => entity.emit("physical-host-attached", this))
        .setRemoveHandler(entity => entity.emit("physical-host-detached", this))

    constructor() {
        super()
        this.world = Box2D.b2World.Create({ x: 0, y: 0 })
        this.setupContactListener()
        this.setupContactFilter()

        this.loop = new AdapterLoop({ maximumSteps: 30, interval: this.physicsTick })

        this.eventHandler.on("tick", (dt: number) => {
            if(this.physicsTick <= 0) return

            this.beforePhysics()
            this.loop.timePassed(dt)
            let timeRemaining = this.loop.getRemainingTime()
            this.afterPhysics(timeRemaining)

            // It's convenient to use physical loop schedule
            // when we speak about contact listeners. There is
            // almost nothing that can be done synchronously
            // in them. So we can just schedule a function call
            // to perform between the current and the next physics
            // step. The problem is that next game tick might occur
            // faster than next physics tick, which may cause some
            // synchronization issues. That is why loop schedule is
            // forcefully flushed after physics tick.

            while(this.loop.schedule.size) {
                this.loop.runScheduledTasks(0)
            }
        })

        this.loop.on("tick", () => this.tickPhysics())
        this.loop.start()
    }

    setIterations(iterations: Box2D.b2StepConfig) {
        this.iterations = iterations
        return this
    }

    setGravity(gravity: Box2D.b2Vec2) {
        this.world.SetGravity(gravity)
        return this
    }

    setPhysicsTick(tick: number) {
        this.loop.setInterval(tick)
        this.physicsTick = tick
        return this
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