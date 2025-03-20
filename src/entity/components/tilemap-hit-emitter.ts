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
    }

    private emitMultipleBlockHits(points: Box2D.b2Vec2[], map: TilemapComponent) {
        if(!this.entity.getComponent(PhysicalComponent).getBody().GetWorld()) return
        for(let point of points) {
            this.emitBlockHit(point, map)
        }
    }

    private emitBlockHit(point: Box2D.XY, map: TilemapComponent) {
        let transform = map.entity.getComponent(TransformComponent).getInvertedGlobalTransform()

        let localX = transform.transformX(point.x, point.y)
        let localY = transform.transformY(point.x, point.y)

        let blockX = map.localToBlockX(localX)
        let blockY = map.localToBlockY(localY)

        const block = map.getBlock(blockX, blockY)
        if (block && block.solid) {
            this.entity.emit("block-hit", blockX, blockY, point, map)
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
            let localBlockX = map.blockToLocalX(blockX)
            let localBlockY = map.blockToLocalY(blockY)

            let nextDistanceX = localVelocity.x > 0 ? localBlockX + 1 - localX : localBlockX - localX
            let nextDistanceY = localVelocity.y > 0 ? localBlockY + 1 - localY : localBlockY - localY

            if (nextDistanceX === 0) nextDistanceX = Math.sign(localVelocity.x)
            if (nextDistanceY === 0) nextDistanceY = Math.sign(localVelocity.y)

            let nextDistanceFraction = 1

            if (localVelocity.x !== 0) nextDistanceFraction = nextDistanceX / localVelocity.x
            if (localVelocity.y !== 0) nextDistanceFraction = Math.min(nextDistanceFraction, nextDistanceY / localVelocity.y)

            if (nextDistanceFraction < Number.EPSILON) {
                nextDistanceFraction = Number.EPSILON
            }

            const checkX = map.localToBlockX(localX + localVelocity.x * nextDistanceFraction * 0.5)
            const checkY = map.localToBlockY(localY + localVelocity.y * nextDistanceFraction * 0.5)

            if (map.getBlock(checkX, checkY)?.solid) {
                this.entity.emit("block-hit", checkX, checkY, point, map)
                return
            }

            localX += localVelocity.x * nextDistanceFraction
            localY += localVelocity.y * nextDistanceFraction

            blockX = map.localToBlockX(localX)
            blockY = map.localToBlockY(localY)
        }
    }
}