import * as Box2D from "../../library/box2d";
import EntityModel from "../entity-model";
import PhysicsChunk from "../../physics/physics-chunk";
import PhysicalComponent from "./physics-component";
import GameMap from "../../map/game-map";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";

export default class TilemapHitEmitter implements Component {
    entity: Entity | null;
    private eventHandler = new BasicEventHandlerSet()

    constructor() {
        this.eventHandler.on("physical-contact", (body, contact) => {
            this.onBodyHit(body, contact)
        })
    }

    onBodyHit(body: Box2D.Body, contact: Box2D.Contact) {
        const data = body.GetUserData()
        if(data instanceof EntityModel) this.entity.emit("entity-hit", data)
        if(data instanceof PhysicsChunk) {
            const worldManifold = new Box2D.WorldManifold()
            contact.GetWorldManifold(worldManifold)
            const points = worldManifold.points.slice(0, contact.GetManifold().pointCount)
            this.emitMultipleBlockHits(points, data.getMap())
        }
    }

    private emitMultipleBlockHits(points: Box2D.Vec2[], map: GameMap) {
        if(!this.entity.getComponent(PhysicalComponent).getBody().GetWorld()) return
        for(let point of points) {
            this.emitBlockHit(point, map)
        }
    }

    private emitBlockHit(point: Box2D.Vec2, map: GameMap) {
        let blockX = point.x / GameMap.BLOCK_SIZE
        let blockY = point.y / GameMap.BLOCK_SIZE

        const gridX = Math.floor(blockX)
        const gridY = Math.floor(blockY)

        const block = map.getBlock(gridX, gridY)
        if(block && block.solid) {
            this.entity.emit("block-hit", gridX, gridY, point)
            return
        }

        const velocity = new Box2D.Vec2()
        this.entity.getComponent(PhysicalComponent).getBody().GetLinearVelocityFromWorldPoint(point, velocity)

        if(velocity.x === 0 && velocity.y === 0) return

        while(true) {
            let nextDistanceX = velocity.x > 0 ? Math.ceil(blockX) - blockX : Math.floor(blockX) - blockX
            let nextDistanceY = velocity.y > 0 ? Math.ceil(blockY) - blockY : Math.floor(blockY) - blockY

            if (nextDistanceX === 0) nextDistanceX = Math.sign(velocity.x)
            if (nextDistanceY === 0) nextDistanceY = Math.sign(velocity.y)

            let nextDistanceFraction = 1

            if (velocity.x !== 0) nextDistanceFraction = nextDistanceX / velocity.x
            if (velocity.y !== 0) nextDistanceFraction = Math.min(nextDistanceFraction, nextDistanceY / velocity.y)

            if(nextDistanceFraction < Number.EPSILON) {
                nextDistanceFraction = Number.EPSILON
            }

            const checkX = Math.floor(blockX + velocity.x * nextDistanceFraction * 0.5)
            const checkY = Math.floor(blockY + velocity.y * nextDistanceFraction * 0.5)

            if(checkX !== gridX || checkY !== gridY) {
                this.entity.emit("block-hit", checkX, checkY, point)
                return
            }

            blockX += velocity.x * nextDistanceFraction
            blockY += velocity.y * nextDistanceFraction
        }
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(null)
    }
}