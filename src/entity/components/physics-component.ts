import {Component} from "../../utils/ecs/component";
import * as Box2D from "../../library/box2d";
import Entity from "../../utils/ecs/entity";
import TransformComponent from "./transform-component";
import PhysicalHostComponent from "../../physiсal-world-component";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import {TransmitterSet} from "./network/transmitting/transmitter-set";
import PositionTransmitter from "./network/position/position-transmitter";

export default class PhysicalComponent implements Component {
    entity: Entity | null
    body: Box2D.Body
    host: PhysicalHostComponent
    positionUpdated: boolean = false
    bodyConstructor: (host: PhysicalHostComponent) => Box2D.Body

    private eventListener = new BasicEventHandlerSet()
    private positionComponent?: TransformComponent

    constructor(bodyConstructor: (host: PhysicalHostComponent) => Box2D.Body) {
        this.body = null
        this.host = null
        this.bodyConstructor = bodyConstructor

        this.eventListener.on("will-detach-from-parent", (child, parent) => {
            if(child !== this.entity) return;
            this.setHost(null)
        })

        this.eventListener.on("attached-to-parent", (child, parent) => {
            if(child !== this.entity) return;
            this.setHost(parent.getComponent(PhysicalHostComponent))
        })

        this.eventListener.on("physical-host-attached", (host) => {
            this.setHost(host)
        })

        this.eventListener.on("transmitter-set-attached", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(PositionTransmitter)
        })

        this.eventListener.on("teleport", () => {
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
        const transformComponent = this.getPositionComponent().transform
        const position = this.body.GetPosition()

        transformComponent.reset()
        transformComponent.translate(position.x, position.y)
        transformComponent.rotate(-this.body.GetAngle())

        if(this.positionUpdated) {
            this.positionUpdated = false
            this.entity.emit("teleport")
        }

        this.entity.emit("physics-tick", dt)
    }

    onDetach() {
        this.entity = null
        this.eventListener.setTarget(null)
        this.setHost(null)
    }

    onAttach(entity: Entity) {
        this.entity = entity
        this.eventListener.setTarget(entity)
    }

    getBody() {
        return this.body
    }

    setHost(host: PhysicalHostComponent) {
        if(host == this.host) return;

        if(this.host) {
            this.host.world.DestroyBody(this.body)
            this.host.destroyComponent(this)
        }

        this.host = host

        if(this.host) {
            this.body = this.bodyConstructor(host)
            this.body.SetUserData(this.entity)
            this.host.registerComponent(this)
            this.entity.emit("physical-body-created", this)
        }
    }

    setPosition(position: Box2D.XY) {
        this.body.SetPosition(position)
        this.positionUpdated = true
    }

    setAngle(angle: number) {
        this.body.SetAngle(angle)
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
}