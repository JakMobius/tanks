import * as Box2D from "@box2d/core";
import Entity from "src/utils/ecs/entity";
import TransformComponent from "./transform/transform-component";
import PhysicalHostComponent from "src/entity/components/physical-host-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { b2ScaledCircleShape, b2ScaledPolygonShape } from "src/physics/b2-scale-shape";

export default class PhysicalComponent extends EventHandlerComponent {
    body: Box2D.b2Body
    host: PhysicalHostComponent
    bodyConstructor: (host: PhysicalHostComponent) => Box2D.b2Body
    transformDirty = true

    constructor(bodyConstructor: (host: PhysicalHostComponent) => Box2D.b2Body) {
        super()
        this.body = null
        this.host = null
        this.bodyConstructor = bodyConstructor

        this.eventHandler.on("physical-host-attached", (host) => this.setHost(host))
        this.eventHandler.on("physical-host-detached", (host) => this.setHost(null))
        this.eventHandler.on("position-update", () => this.transformDirty = true)
    }

    beforePhysics() {
        this.entity.emit("before-physics")
    }

    onPhysicsTick(dt: number) {
        this.readTransform()
        this.entity.emit("physics-tick", dt)
    }

    afterPhysics(timeRemaining: number) {
        this.writeTransform(timeRemaining)
    }

    onDetach() {
        super.onDetach()
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
            this.host.world.DestroyBody(this.body)
            this.host.unregisterComponent(this)
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

    setVelocity(velocity: Box2D.XY) {
        this.body.SetLinearVelocity(velocity)
    }

    setAngularVelocity(velocity: number) {
        this.body.SetAngularVelocity(velocity)
    }

    private readTransform() {
        if(!this.transformDirty) return

        let transformComponent = this.entity.getComponent(TransformComponent)
        let position = transformComponent.getGlobalPosition()
        let angle = transformComponent.getGlobalAngle()
        
        let fixtures = this.body.GetFixtureList()
        while(fixtures) {
            let shape = fixtures.GetShape()
            if(shape instanceof b2ScaledPolygonShape) {
                shape.SetScale(transformComponent.getGlobalScale())
            }
            if(shape instanceof b2ScaledCircleShape) {
                shape.SetScale(transformComponent.getGlobalScale())
            }

            fixtures = fixtures.GetNext()
        }

        this.body.SetTransformVec(position, angle)

        this.transformDirty = false
    }

    private writeTransform(extraTime: number) {
        if(this.body.GetType() === Box2D.b2BodyType.b2_staticBody) return

        let transform = this.entity.getComponent(TransformComponent)

        let position = this.body.GetPosition()
        let velocity = this.body.GetLinearVelocity()
        let angle = this.body.GetAngle()
        let angularVelocity = -this.body.GetAngularVelocity()

        transform.setGlobal({
            position: { x: position.x + velocity.x * extraTime, y: position.y + velocity.y * extraTime },
            angle: angle + angularVelocity * extraTime
        })
    }
}