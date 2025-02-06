import * as Box2D from "@box2d/core";
import Entity from "src/utils/ecs/entity";
import TransformComponent from "./transform-component";
import PhysicalHostComponent from "src/entity/components/physical-host-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class PhysicalComponent extends EventHandlerComponent {
    body: Box2D.b2Body
    host: PhysicalHostComponent
    positionUpdated: boolean = false
    bodyConstructor: (host: PhysicalHostComponent) => Box2D.b2Body

    private positionComponent?: TransformComponent

    constructor(bodyConstructor: (host: PhysicalHostComponent) => Box2D.b2Body) {
        super()
        this.body = null
        this.host = null
        this.bodyConstructor = bodyConstructor

        this.eventHandler.on("will-detach-from-parent", () => {
            this.setHost(null)
        })

        this.eventHandler.on("attached-to-parent", (parent) => {
            this.setHost(parent.getComponent(PhysicalHostComponent))
        })

        this.eventHandler.on("physical-host-attached", (host) => {
            this.setHost(host)
        })

        this.eventHandler.on("teleport", () => {
            this.host.entity.emit("entity-teleport", this.entity)
        })
    }

    getPositionComponent() {
        if(!this.positionComponent || this.positionComponent.entity != this.entity) {
            this.positionComponent = this.entity.getComponent(TransformComponent)
        }
        return this.positionComponent;
    }

    onPhysicsTick(dt: number) {
        this.updateTransform()

        if(this.positionUpdated) {
            this.positionUpdated = false
            this.entity.emit("teleport")
        }

        this.entity.emit("physics-tick", dt)
    }

    onDetach() {
        super.onDetach()
        this.setHost(null)
    }

    onAttach(entity: Entity) {
        super.onAttach(entity)
        if(entity.parent) {
            this.setHost(entity.parent.getComponent(PhysicalHostComponent))
        }
    }

    getBody() {
        return this.body
    }

    setHost(host: PhysicalHostComponent) {
        if(host === this.host) return;

        if(this.host) {
            // @ts-ignore
            if(global.isWithinTick) {
                throw new Error("OUCH!!!!!")
            }
            this.host.world.DestroyBody(this.body)
            this.host.destroyComponent(this)
        }

        this.host = host

        if(this.host) {
            this.body = this.bodyConstructor(host)

            // Box2D solvers are stored statically. Resolved contacts
            // are sometimes cached in memory, as well as corresponding
            // bodies and their user data. This is not much of a
            // performance problem, but it makes real memory leaks harder
            // to detect.

            this.body.SetUserData({
                entity: new WeakRef(this.entity)
            })
            this.host.registerComponent(this)
            this.entity.emit("physical-body-created", this)
        }
    }

    setPositionAngle(position: Box2D.XY, angle: number) {
        this.body.SetTransformVec(position, angle)
        this.updateTransform()
        this.positionUpdated = true
    }

    setVelocity(velocity: Box2D.XY) {
        this.body.SetLinearVelocity(velocity)
        this.positionUpdated = true
    }

    setAngularVelocity(velocity: number) {
        this.body.SetAngularVelocity(velocity)
        this.positionUpdated = true
    }

    private updateTransform() {
        const transformComponent = this.getPositionComponent().transform
        const position = this.body.GetPosition()

        transformComponent.reset()
        transformComponent.translate(position.x, position.y)
        transformComponent.rotate(-this.body.GetAngle())
    }
}