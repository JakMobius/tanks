import ChunkedMapCollider, {PhysicsPoint} from "./chunked-map-collider";
import * as Box2D from "@box2d/core"
import {PhysicsBlock} from "./physics-block";
import {epsilon, signedDoubleTriangleSurface} from "../utils/utils";
import EdgeFindingContext from "./edge-finding-context";
import {MeshGenerationContext} from "./mesh-generation-context";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import {physicsCategories, physicsMasks} from "./categories";
import PhysicalHostComponent from "src/entity/components/physical-host-component";
import { WorldComponent } from "src/entity/game-world-entity-prefab";
import TilemapComponent from "src/map/tilemap-component";

export default class PhysicsChunk {
    public readonly collider: ChunkedMapCollider;
    public readonly x: number;
    public readonly y: number;
    public readonly width: number;
    public readonly height: number;
    private body: Box2D.b2Body | null = null
    public blocks: PhysicsBlock[] | null = null
    private edgeFindingContext: EdgeFindingContext;
    private meshGenerationContext: MeshGenerationContext;
    private eventHandlers: BasicEventHandlerSet;
    needsUpdate: boolean = false
    lastRelevanceTime: number = 0
    edgePaths: PhysicsPoint[][];
    edgeMesh: PhysicsPoint[][];

    constructor(collider: ChunkedMapCollider, x: number, y: number) {
        this.collider = collider
        this.x = x
        this.y = y
        this.width = this.collider.chunkWidth
        this.height = this.collider.chunkHeight
        this.edgeFindingContext = new EdgeFindingContext(this)
        this.meshGenerationContext = new MeshGenerationContext(this)

        this.eventHandlers = new BasicEventHandlerSet()
        this.eventHandlers.on("map-block-change", (event) => this.onBlockUpdate(event.x, event.y))
    }

    onBlockUpdate(x: number, y: number) {
        let localX = x - this.x
        let localY = y - this.y

        if (localX >= 0 && localY >= 0 && localX < this.width && localY < this.height) {
            this.blocks[localX + localY * this.width].updateBlock(this.collider.getMap().getBlock(x, y))
            this.needsUpdate = true
        }
    }

    listen() {
        this.eventHandlers.setTarget(this.collider.entity)
        this.needsUpdate = true
    }

    destroy() {
        this.eventHandlers.setTarget(null)
        this.removeBody()
    }

    private loadBlocks() {
        const map = this.collider.getMap();

        this.blocks = new Array(this.width * this.height)

        for (let y = this.y, dy = 0, i = 0; dy < this.height; y++, dy++) {
            for (let x = this.x, dx = 0; dx < this.width; x++, dx++, i++) {
                this.blocks[i] = new PhysicsBlock(map?.getBlock(x, y) ?? null)
            }
        }
    }

    private generateMesh() {
        this.edgePaths = this.edgeFindingContext.findPaths()
        this.edgeMesh = this.meshGenerationContext.generateMesh(this.edgePaths)
    }

    public updateBody() {
        if (!this.blocks) this.loadBlocks()

        if (this.body) {
            this.body.GetWorld().DestroyBody(this.body)
        }

        const world = WorldComponent.getWorld(this.collider.entity)
        const body = world.getComponent(PhysicalHostComponent).world.CreateBody({
            type: Box2D.b2BodyType.b2_staticBody,
            position: {x: this.x * TilemapComponent.BLOCK_SIZE, y: this.y * TilemapComponent.BLOCK_SIZE},
        })

        this.generateMesh()
        for (let shape of this.edgeMesh) {
            const pointShape = shape.map(point => ({
                x: point[0] * TilemapComponent.BLOCK_SIZE,
                y: point[1] * TilemapComponent.BLOCK_SIZE
            }))

            const polygonShape = new Box2D.b2PolygonShape()
            polygonShape.Set(pointShape)

            body.CreateFixture({
                shape: polygonShape,
                density: 1.0,
                friction: 0.1,
                restitution: 0.1,
                filter: {
                    categoryBits: physicsCategories.wall,
                    maskBits: physicsMasks.wall
                }
            })
        }

        if (this.body) this.body.SetUserData({
            entity: null
        })
        this.body = body

        // Box2D solvers are stored statically. Resolved contacts
        // are sometimes cached in memory, as well as corresponding
        // bodies and their user data. This is not much of a
        // performance problem, but it makes real memory leaks harder
        // to detect.
        this.body.SetUserData({
            physicsChunk: new WeakRef(this)
        })
        this.needsUpdate = false
    }

    getBlock(x: number, y: number) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return PhysicsBlock.nullBlock
        } else {
            return this.blocks[x + y * this.width]
        }
    }

    /**
     * Determines on which side of the vector the block body is located.
     * @returns 1 if the block is to the right of the vector,
     * -1 if the block is to the left of the vector, 0 if the value cannot be counted
     */
    getFacing(fromX: number, fromY: number, toX: number, toY: number, blockX: number, blockY: number) {
        let block = this.getBlock(blockX, blockY)

        for (let edge of block.edges) {
            let surface = signedDoubleTriangleSurface(fromX, fromY, edge.getSourceX() + blockX, edge.getSourceY() + blockY, toX, toY)
            if (surface > epsilon) return 1
            if (surface < -epsilon) return -1

            surface = signedDoubleTriangleSurface(fromX, fromY, edge.getTargetX() + blockX, edge.getTargetY() + blockY, toX, toY)
            if (surface > epsilon) return 1
            if (surface < -epsilon) return -1
        }

        return 0
    }

    private removeBody() {
        if (this.body) {
            this.body.GetWorld().DestroyBody(this.body)
            this.body = null
        }
    }

    setRelevant() {
        this.lastRelevanceTime = this.collider.time
    }

    getMap() {
        return this.collider.getMap()
    }

    static getFromBody(body: Box2D.b2Body) {
        let userData = body.GetUserData()

        if (!(userData instanceof WeakRef)) {
            return null
        }

        let entity = userData.deref()

        if (!(entity instanceof PhysicsChunk)) {
            return null
        }

        return entity
    }
}