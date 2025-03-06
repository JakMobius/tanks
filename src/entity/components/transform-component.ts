import * as Box2D from "@box2d/core";
import Entity from "src/utils/ecs/entity";
import { Matrix3, ReadonlyMatrix3 } from "src/utils/matrix3";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { PropertyInspector, VectorProperty } from "./inspector/property-inspector";
import { TransmitterSet } from "./network/transmitting/transmitter-set";
import PositionTransmitter from "./network/position/position-transmitter";
import { degToRad, radToDeg } from "src/utils/utils";

export default class TransformComponent extends EventHandlerComponent {
    entity: Entity | null
    private transform: Matrix3 | null = null
    globalTransform: Matrix3 | null = null

    constructor(transform?: Matrix3) {
        super()
        if (transform) {
            this.transform = transform;
        } else {
            this.transform = new Matrix3();
        }

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            let positionProperty = new VectorProperty("position", 2)
                .withName("Расположение")
                .withPrefixes(["X", "Y"])
                .withGetter(() => {
                    let position = this.getPosition()
                    return [position.x, position.y]
                })
                .withSetter(([x, y]) => {
                    this.setPosition(new Box2D.b2Vec2(x, y))
                })
                .updateOn("position-update")
                .replaceNaN()

            let angleProperty = new VectorProperty("angle", 1)
                .withName("Угол")
                .withGetter(() => [radToDeg(this.getAngle())])
                .withSetter(([angle]) => {
                    let position = this.getPosition()
                    this.setPositionAngle(position, degToRad(angle))
                })
                .updateOn("position-update")
                .replaceNaN()

            inspector.addProperty(positionProperty)
            inspector.addProperty(angleProperty)
        })

        this.eventHandler.on("attached-to-parent", () => this.markDirty())
        this.eventHandler.on("detached-from-parent", () => this.markDirty())

        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(PositionTransmitter)
        })
    }

    getTransform() {
        return this.transform as ReadonlyMatrix3
    }

    setPosition(position: Box2D.XY) {
        const currentPosition = this.getPosition()
        let newMatrix = new Matrix3()
        newMatrix.translate(position.x - currentPosition.x, position.y - currentPosition.y)
        newMatrix.multiply(this.transform)
        this.transform = newMatrix
        this.markDirty()
    }

    setPositionAngle(position: Box2D.XY, angle: number) {
        this.transform.reset()
        this.transform.translate(position.x, position.y)
        this.transform.rotate(-angle)
        this.markDirty()
    }

    updateTransform(body: (matrix: Matrix3) => void) {
        body(this.transform)
        this.markDirty()
    }

    getAngle(): number {
        return Math.atan2(this.transform.get(1), this.transform.get(0));
    }

    getPosition() {
        return new Box2D.b2Vec2(this.transform.get(6), this.transform.get(7))
    }

    getDirection() {
        return new Box2D.b2Vec2(this.transform.get(0), this.transform.get(1))
    }

    getGlobalAngle() {
        let direction = this.getGlobalTransform()
        return Math.atan2(direction.get(1), direction.get(0))
    }

    getGlobalDirection() {
        let direction = this.getGlobalTransform()
        return new Box2D.b2Vec2(direction.get(0), direction.get(1))
    }

    getGlobalPosition() {
        let position = this.getGlobalTransform()
        return new Box2D.b2Vec2(position.get(6), position.get(7))
    }

    setGlobalPositionAngle(position: Box2D.XY, angle: number) {
        let matrix = new Matrix3()
        matrix.translate(position.x, position.y)
        matrix.rotate(-angle)
        this.setGlobalTransform(matrix)
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
    }

    getGlobalTransform() {
        if(this.globalTransform) {
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

    emitGlobalPositionUpdate() {
        this.entity.emit("position-update")
    }

    markDirty() {
        this.emitGlobalPositionUpdate()
        if(this.globalTransform !== null) {
            this.globalTransform = null
            this.markChildrenDirty()
        }
    }

    markChildrenDirty() {
        let children = this.entity?.children
        if(!children) return
        for (let child of children) {
            child.getComponent(TransformComponent)?.markDirty()
        }
    }
}

