import * as Box2D from "@box2d/core";
import Entity from "src/utils/ecs/entity";
import { Matrix3, ReadonlyMatrix3 } from "src/utils/matrix3";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { PropertyInspector, VectorProperty } from "../inspector/property-inspector";
import { TransmitterSet } from "../network/transmitting/transmitter-set";
import TransformTransmitter from "./transform-transmitter";
import { degToRad, radToDeg } from "src/utils/utils";

function getScale(transform: ReadonlyMatrix3) {
    let x = Math.sqrt(transform.get(0) ** 2 + transform.get(1) ** 2)
    let y = Math.sqrt(transform.get(3) ** 2 + transform.get(4) ** 2)

    let basis1X = transform.get(0) / x
    let basis1Y = transform.get(1) / x

    let basis2X = transform.get(3) / y
    let basis2Y = transform.get(4) / y

    if(basis1X * basis2Y - basis1Y * basis2X < 0) {
        y = -y
    }

    return { x, y }
}

function getPosition(transform: ReadonlyMatrix3) {
    return { x: transform.get(6), y: transform.get(7) }
}

function getDirection(transform: ReadonlyMatrix3) {
    return { x: transform.get(0), y: transform.get(1) }
}

function getAngle(transform: ReadonlyMatrix3) {
    let direction = getDirection(transform)
    return Math.atan2(-direction.y, direction.x);
}

interface TransformParameters {
    position?: Box2D.XY
    angle?: number
    scale?: Box2D.XY 
}

function alterTransform(transform: Matrix3, params: TransformParameters) {
    let position = params.position ?? getPosition(transform)
    let angle = params.angle ?? getAngle(transform)
    let scale = params.scale ?? getScale(transform)

    transform.reset()
    transform.translate(position.x, position.y)
    transform.rotate(angle)
    transform.scale(scale.x, scale.y)

    return transform
}

export default class TransformComponent extends EventHandlerComponent {
    entity: Entity | null
    private transform = new Matrix3()
    private globalTransform: Matrix3 | null = null
    private invertedGlobalTransform: Matrix3 | null = null

    constructor() {
        super()

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            let positionProperty = new VectorProperty("position", 2)
                .withName("Расположение")
                .withPrefixes(["X", "Y"])
                .withGetter(() => {
                    let position = this.getPosition()
                    return [position.x, position.y]
                })
                .withSetter(([x, y]) => {
                    this.set({ position: { x, y } })
                })
                .updateOn("position-update")
                .replaceNaN()

            let angleProperty = new VectorProperty("angle", 1)
                .withName("Угол")
                .withGetter(() => [radToDeg(this.getAngle())])
                .withSetter(([angle]) => {
                    this.set({ angle: degToRad(angle) })
                })
                .updateOn("position-update")
                .replaceNaN()
            
            let scaleProperty = new VectorProperty("scale", 2)
                .withName("Масштаб")
                .withPrefixes(["X", "Y"])
                .withGetter(() => {
                    let scale = this.getScale()
                    return [scale.x, scale.y]
                })
                .withSetter(([x, y]) => {
                    this.set({ scale: { x, y } })
                })
                .updateOn("position-update")
                .replaceNaN()

            inspector.addProperty(positionProperty)
            inspector.addProperty(angleProperty)
            inspector.addProperty(scaleProperty)
        })

        this.eventHandler.on("attached-to-parent", () => this.markDirty())
        this.eventHandler.on("detached-from-parent", () => this.markDirty())

        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(TransformTransmitter)
        })
    }

    getTransform() {
        return this.transform as ReadonlyMatrix3
    }

    getAngle() { return getAngle(this.transform)}
    getScale() { return getScale(this.transform) }
    getPosition() { return getPosition(this.transform) }
    getDirection() { return getDirection(this.transform) }

    set(parameters: TransformParameters) {
        this.setTransform(alterTransform(this.transform, parameters))
        return this
    }

    setTransform(transform: Matrix3) {
        this.transform = transform
        this.markDirty()
        return this
    }

    getGlobalAngle(): number { return getAngle(this.getGlobalTransform()) }
    getGlobalScale() { return getScale(this.getGlobalTransform()) }
    getGlobalPosition() { return getPosition(this.getGlobalTransform()) }
    getGlobalDirection() { return getDirection(this.getGlobalTransform()) }

    setGlobal(parameters: TransformParameters) {
        let transform = this.getGlobalTransform().clone()
        this.setGlobalTransform(alterTransform(transform, parameters))
        return this
    }

    setGlobalTransform(transform: ReadonlyMatrix3) {
        let parentTransform = this.entity?.parent?.getComponent(TransformComponent)

        if (!parentTransform) {
            this.transform = transform.clone()
        } else {
            let parentGlobalTransform = parentTransform.getGlobalTransform()
            this.transform = parentGlobalTransform.inverted()
            this.transform.multiply(transform)
        }
        this.markDirty()
        return this
    }

    getGlobalTransform() {
        if (this.globalTransform) {
            return this.globalTransform as ReadonlyMatrix3
        }

        let parent = this.entity?.parent?.getComponent(TransformComponent)
        if (parent) {
            let parentTransform = parent.getGlobalTransform()
            this.globalTransform = parentTransform.multiplied(this.transform)
        } else {
            this.globalTransform = this.transform.clone()
        }
        return this.globalTransform as ReadonlyMatrix3
    }

    getInvertedGlobalTransform() {
        if (this.invertedGlobalTransform) {
            return this.invertedGlobalTransform as ReadonlyMatrix3
        }

        this.invertedGlobalTransform = this.getGlobalTransform().inverted()
        return this.invertedGlobalTransform as ReadonlyMatrix3
    }

    emitGlobalPositionUpdate() {
        this.entity?.emit("position-update")
    }

    markDirty() {
        this.emitGlobalPositionUpdate()
        if (this.globalTransform !== null || !this.invertedGlobalTransform) {
            this.globalTransform = null
            this.invertedGlobalTransform = null
            this.markChildrenDirty()
        }
    }

    markChildrenDirty() {
        let children = this.entity?.children
        if (!children) return
        for (let child of children) {
            child.getComponent(TransformComponent)?.markDirty()
        }
    }
}

