
import EntityModel, {EntityModelType} from './entity-model';
import AbstractWorld from 'src/abstract-world';
import BinaryEncoder from "../serialization/binary/binary-encoder";
import BinaryDecoder from "../serialization/binary/binary-decoder";
import {Constructor} from "../serialization/binary/serializable";
import {b2Body} from "../library/box2d/dynamics/b2_body";
import PhysicsChunk from "../physics/physics-chunk";
import * as Box2D from "../library/box2d";
import GameMap from "../map/game-map";
import PhysicalComponent from "./physics-component";

export default abstract class AbstractEntity<
        WorldClass extends AbstractWorld = any,
        ModelClass extends EntityModel = EntityModel
    > {

    public static Model: Constructor<EntityModel> & EntityModelType = null

    protected world: WorldClass

    public getWorld(): WorldClass & AbstractWorld { return this.world }
    public setWorld(game: WorldClass & AbstractWorld) { this.world = game }

    protected constructor(model: ModelClass) {
        this.model = model
        model.entity = this
    }

    public model: ModelClass = null

    tick(dt: number) {
        this.model.tick(dt)
    }

    abstract encodeInitialData(encoder: BinaryEncoder): void
    abstract decodeInitialData(decoder: BinaryDecoder): void

    abstract encodeDynamicData(encoder: BinaryEncoder): void
    abstract decodeDynamicData(decoder: BinaryDecoder): void
    abstract damage(damage: number): void

    shouldHitEntity(entity: AbstractEntity) { return true }

    /**
     * Called immediately when entity hits another entity
     */
    onEntityHit(entity: AbstractEntity) {}

    /**
     * Called immediately when entity hits a block
     */
    onBlockHit(x: number, y: number, contactPoint: Box2D.Vec2) {}

    /**
     * Called immediately when entity hits a body
     */
    onBodyHit(body: Box2D.Body, contact: Box2D.Contact) {
        const data = body.GetUserData()
        if(data instanceof EntityModel) this.onEntityHit(data.entity)
        if(data instanceof PhysicsChunk) {
            const worldManifold = new Box2D.WorldManifold()
            contact.GetWorldManifold(worldManifold)
            const points = worldManifold.points.slice(0, contact.GetManifold().pointCount)
            this.emitMultipleBlockHits(points)
        }
    }

    shouldHitBody(body: b2Body) {
        const data = body.GetUserData()
        if(data instanceof EntityModel) return this.shouldHitEntity(data.entity)
        return true
    }

    private emitMultipleBlockHits(points: Box2D.Vec2[]) {
        for(let point of points) {
            if(!this.model.getComponent(PhysicalComponent).getBody().GetWorld()) continue
            this.emitBlockHit(point)
        }
    }

    private emitBlockHit(point: Box2D.Vec2) {
        let blockX = point.x / GameMap.BLOCK_SIZE
        let blockY = point.y / GameMap.BLOCK_SIZE

        const gridX = Math.floor(blockX)
        const gridY = Math.floor(blockY)

        const block = this.getWorld().map.getBlock(gridX, gridY)
        if(block && block.solid) {
            this.onBlockHit(gridX, gridY, point)
            return
        }

        const velocity = new Box2D.Vec2()
        this.model.getComponent(PhysicalComponent).getBody().GetLinearVelocityFromWorldPoint(point, velocity)

        if(velocity.x === 0 && velocity.y === 0) return

        while(true) {
            let nextDistanceX = velocity.x > 0 ? Math.ceil(blockX) - blockX : Math.floor(blockX) - blockX
            let nextDistanceY = velocity.y > 0 ? Math.ceil(blockY) - blockY : Math.floor(blockY) - blockY

            if (nextDistanceX === 0) nextDistanceX = Math.sign(velocity.x)
            if (nextDistanceY === 0) nextDistanceY = Math.sign(velocity.y)

            let nextDistanceFraction = 1

            if (velocity.x !== 0) nextDistanceFraction = nextDistanceX / velocity.x
            if (velocity.y !== 0) nextDistanceFraction = Math.min(nextDistanceFraction, nextDistanceY / velocity.y)

            const checkX = Math.floor(blockX + velocity.x * nextDistanceFraction * 0.5)
            const checkY = Math.floor(blockY + velocity.y * nextDistanceFraction * 0.5)

            if(checkX !== gridX || checkY !== gridY) {
                this.onBlockHit(checkX, checkY, point)
                return
            }

            blockX += velocity.x * nextDistanceFraction
            blockY += velocity.y * nextDistanceFraction
        }
    }
}