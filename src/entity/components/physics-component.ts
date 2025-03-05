import * as Box2D from "@box2d/core";
import Entity from "src/utils/ecs/entity";
import TransformComponent from "./transform-component";
import PhysicalHostComponent from "src/entity/components/physical-host-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { Matrix3, ReadonlyMatrix3 } from "src/utils/matrix3";

export default class PhysicalComponent extends EventHandlerComponent {
    body: Box2D.b2Body
    host: PhysicalHostComponent
    positionUpdated: boolean = false
    bodyConstructor: (host: PhysicalHostComponent) => Box2D.b2Body
    oldTransform: ReadonlyMatrix3

    private positionComponent?: TransformComponent

    constructor(bodyConstructor: (host: PhysicalHostComponent) => Box2D.b2Body) {
        super()
        this.body = null
        this.host = null
        this.bodyConstructor = bodyConstructor

        this.eventHandler.on("will-detach-from-parent", () => this.detachFromPhysicsHost())

        this.eventHandler.on("attached-to-parent", (parent) => {
            this.setHost(parent.getComponent(PhysicalHostComponent))
        })

        this.eventHandler.on("physical-host-attached", (host) => this.setHost(host))
    }

    getPositionComponent() {
        if(!this.positionComponent || this.positionComponent.entity != this.entity) {
            this.positionComponent = this.entity.getComponent(TransformComponent)
        }
        return this.positionComponent;
    }

    beforePhysics() {
        let updatePos = false
        let currentTransform = this.getPositionComponent()
        if(this.oldTransform) {
            let currentTransform = this.getPositionComponent().getGlobalTransform()
            if(!this.oldTransform.equals(currentTransform)) {
                this.oldTransform = currentTransform.clone()
                updatePos = true
            }
        } else {
            updatePos = true
        }

        if(updatePos) {
            let position = currentTransform.getGlobalPosition()
            let angle = currentTransform.getGlobalAngle()
            
            this.body.SetTransformVec(position, angle)
        }
    }

    onPhysicsTick(dt: number) {
        this.entity.emit("physics-tick", dt)
        this.updateTransform()
    }

    onDetach() {
        super.onDetach()
        this.detachFromPhysicsHost()
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

    setVelocity(velocity: Box2D.XY) {
        this.body.SetLinearVelocity(velocity)
    }

    setAngularVelocity(velocity: number) {
        this.body.SetAngularVelocity(velocity)
    }

    private updateTransform() {
        const position = this.body.GetPosition()

        this.getPositionComponent().setGlobalPositionAngle(position, this.body.GetAngle())
    }

    detachFromPhysicsHost(): void {
        this.setHost(null)
        this.oldTransform = null
    }
}