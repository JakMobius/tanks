import * as Box2D from "@box2d/core";
import Entity from "src/utils/ecs/entity";
import { Matrix3, ReadonlyMatrix3 } from "src/utils/matrix3";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { PropertyInspector, VectorProperty } from "../inspector/property-inspector";
import { degToRad, radToDeg } from "src/utils/utils";

interface TransformParameters {
    position?: Box2D.XY
    angle?: number
    scale?: Box2D.XY 
}

function alterTransform(transform: Matrix3, params: TransformParameters) {
    let position = params.position ?? transform.getPosition()
    let angle = params.angle ?? transform.getAngle()
    let scale = params.scale ?? transform.getScale()

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
    }

    getTransform() {
        return this.transform as ReadonlyMatrix3
    }

    getAngle() { return this.transform.getAngle()}
    getScale() { return this.transform.getScale() }
    getPosition() { return this.transform.getPosition() }
    getDirection() { return this.transform.getDirection() }

    set(parameters: TransformParameters) {
        this.setTransform(alterTransform(this.transform, parameters))
        return this
    }

    setTransform(transform: Matrix3) {
        this.transform = transform
        this.markDirty()
        return this
    }

    getGlobalAngle() { return this.getGlobalTransform().getAngle() }
    getGlobalScale() { return this.getGlobalTransform().getScale() }
    getGlobalPosition() { return this.getGlobalTransform().getPosition() }
    getGlobalDirection() { return this.getGlobalTransform().getDirection() }

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

