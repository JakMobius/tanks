import * as Box2D from "@box2d/core";
import PhysicalComponent from "./physics-component";
import TilemapComponent from "src/map/tilemap-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { getObjectFromBody } from "../physical-body-data";
import TransformComponent from "./transform/transform-component";

export default class TilemapHitEmitter extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("physical-contact-begin", (body, contact) => {
            this.onBodyHit(body, contact)
        })
    }

    onBodyHit(body: Box2D.b2Body, contact: Box2D.b2Contact) {
        const data = getObjectFromBody(body)

        if(data.physicsChunk?.deref()) {
            const worldManifold = new Box2D.b2WorldManifold()
            contact.GetWorldManifold(worldManifold)
            const points = worldManifold.points.slice(0, contact.GetManifold().pointCount)
            this.emitMultipleBlockHits(points, data.physicsChunk.deref().getMap())
        }

        if(data.entity?.deref()) {
            this.entity.emit("entity-hit", data.entity.deref(), contact)
        }
    }

    private emitMultipleBlockHits(points: Box2D.b2Vec2[], map: TilemapComponent) {
        if(!this.entity.getComponent(PhysicalComponent).getBody().GetWorld()) return
        for(let point of points) {
            this.emitBlockHit(point, map)
        }
    }

    private emitBlockHit(point: Box2D.XY, map: TilemapComponent) {
        let transform = map.entity.getComponent(TransformComponent).getInvertedGlobalTransform()

        let blockX = transform.transformX(point.x, point.y)
        let blockY = transform.transformY(point.y, point.y)

        const gridX = Math.floor(blockX)
        const gridY = Math.floor(blockY)

        const block = map.getBlock(gridX, gridY)
        if (block && block.solid) {
            this.entity.emit("block-hit", gridX, gridY, point, map)
            return
        }

        const velocity = { x: 0, y: 0 }
        this.entity.getComponent(PhysicalComponent).getBody().GetLinearVelocityFromWorldPoint(point, velocity)

        const localVelocity = {
            x: transform.transformX(velocity.x, velocity.y, 0),
            y: transform.transformY(velocity.x, velocity.y, 0),
        }

        if (localVelocity.x === 0 && localVelocity.y === 0) return

        for(let i = 0; i < 3; i++) {
            let nextDistanceX = localVelocity.x > 0 ? Math.ceil(blockX) - blockX : Math.floor(blockX) - blockX
            let nextDistanceY = localVelocity.y > 0 ? Math.ceil(blockY) - blockY : Math.floor(blockY) - blockY

            if (nextDistanceX === 0) nextDistanceX = Math.sign(localVelocity.x)
            if (nextDistanceY === 0) nextDistanceY = Math.sign(localVelocity.y)

            let nextDistanceFraction = 1

            if (localVelocity.x !== 0) nextDistanceFraction = nextDistanceX / localVelocity.x
            if (localVelocity.y !== 0) nextDistanceFraction = Math.min(nextDistanceFraction, nextDistanceY / localVelocity.y)

            if (nextDistanceFraction < Number.EPSILON) {
                nextDistanceFraction = Number.EPSILON
            }

            const checkX = Math.floor(blockX + localVelocity.x * nextDistanceFraction * 0.5)
            const checkY = Math.floor(blockY + localVelocity.y * nextDistanceFraction * 0.5)

            if (map.getBlock(checkX, checkY)?.solid) {
                this.entity.emit("block-hit", checkX, checkY, point, map)
                return
            }

            blockX += localVelocity.x * nextDistanceFraction
            blockY += localVelocity.y * nextDistanceFraction
        }
    }
}