import * as Box2D from "@box2d/core";
import PhysicalComponent from "./physics-component";
import TilemapComponent from "src/map/tilemap-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { getObjectFromBody } from "../physical-body-data";

export default class TilemapHitEmitter extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("physical-contact-begin", (body, contact) => {
            this.onBodyHit(body, contact)
        })
    }

    onBodyHit(body: Box2D.b2Body, contact: Box2D.b2Contact) {
        const data = getObjectFromBody(body)
        
        if(data.entity?.deref()) {
            this.entity.emit("entity-hit", data.entity.deref(), contact)
        }

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

    private emitBlockHit(point: Box2D.b2Vec2, map: TilemapComponent) {
        let blockX = point.x / 1
        let blockY = point.y / 1

        const gridX = Math.floor(blockX)
        const gridY = Math.floor(blockY)

        const block = map.getBlock(gridX, gridY)
        if (block && block.solid) {
            this.entity.emit("block-hit", gridX, gridY, point)
            return
        }

        const velocity = new Box2D.b2Vec2()
        this.entity.getComponent(PhysicalComponent).getBody().GetLinearVelocityFromWorldPoint(point, velocity)

        if (velocity.x === 0 && velocity.y === 0) return

        while (true) {
            let nextDistanceX = velocity.x > 0 ? Math.ceil(blockX) - blockX : Math.floor(blockX) - blockX
            let nextDistanceY = velocity.y > 0 ? Math.ceil(blockY) - blockY : Math.floor(blockY) - blockY

            if (nextDistanceX === 0) nextDistanceX = Math.sign(velocity.x)
            if (nextDistanceY === 0) nextDistanceY = Math.sign(velocity.y)

            let nextDistanceFraction = 1

            if (velocity.x !== 0) nextDistanceFraction = nextDistanceX / velocity.x
            if (velocity.y !== 0) nextDistanceFraction = Math.min(nextDistanceFraction, nextDistanceY / velocity.y)

            if (nextDistanceFraction < Number.EPSILON) {
                nextDistanceFraction = Number.EPSILON
            }

            const checkX = Math.floor(blockX + velocity.x * nextDistanceFraction * 0.5)
            const checkY = Math.floor(blockY + velocity.y * nextDistanceFraction * 0.5)

            if (checkX !== gridX || checkY !== gridY) {
                this.entity.emit("block-hit", checkX, checkY, point)
                return
            }

            blockX += velocity.x * nextDistanceFraction
            blockY += velocity.y * nextDistanceFraction
        }
    }
}