import ChunkedMapCollider, {PhysicsPoint} from "./chunked-map-collider";
import * as Box2D from "@box2d/core"
import {PhysicsBlock} from "./physics-block";
import {epsilon, signedDoubleTriangleSurface} from "../utils/utils";
import EdgeFindingContext from "./edge-finding-context";
import {MeshGenerationContext} from "./mesh-generation-context";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import {physicsCategories, physicsMasks} from "./categories";
import PhysicalHostComponent from "src/entity/components/physical-host-component";
import Entity from "src/utils/ecs/entity";
import PhysicalComponent from "src/entity/components/physics-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import { b2ScaledPolygonShape } from "./b2-scale-shape";

export default class PhysicsChunk {
    public readonly collider: ChunkedMapCollider;
    public readonly x: number;
    public readonly y: number;
    public readonly width: number;
    public readonly height: number;
    private entity: Entity | null = null
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
        this.eventHandlers.on("block-change", (event) => this.onBlockUpdate(event.x, event.y))
    }

    onBlockUpdate(x: number, y: number) {
        let localX = x - this.x
        let localY = y - this.y

        if (localX >= 0 && localY >= 0 && localX < this.width && localY < this.height) {
            let newBlock = this.collider.getMap().getBlock(x, y)
            if(this.blocks[localX + localY * this.width].updateBlock(newBlock)) {
                this.needsUpdate = true
            }
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

        this.generateMesh()
        this.removeBody()

        // It should be possible to avoid recreating the entire body
        // just by recreating its fixtures (whenever they change).
        // However, i tried, and box2d refused to work this way.

        this.entity = new Entity()
        this.entity.on("before-physics", () => this.update())
        this.entity.addComponent(new TransformComponent().set({ position: { x: this.x, y: this.y } }))
        this.entity.addComponent(new PhysicalComponent((host: PhysicalHostComponent) => {
            let body = host.world.CreateBody({ type: Box2D.b2BodyType.b2_staticBody })

            for(let shape of this.edgeMesh) {
                const pointShape = shape.map(point => ({
                    x: point[0],
                    y: point[1]
                }))
    
                const polygonShape = new b2ScaledPolygonShape()
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

            // Box2D solvers are stored statically. Resolved contacts
            // are sometimes cached in memory, as well as corresponding
            // bodies and their user data. It's not much of a performance
            // problem, but it makes real memory leaks harder to detect.
            body.SetUserData({
                physicsChunk: new WeakRef(this)
            })

            return body
        }))
        this.collider.entity.appendChild(this.entity)

        this.needsUpdate = false
    }

    update() {
        if(this.needsUpdate) {
            this.updateBody()
        }
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
        if (this.entity) {
            this.entity.removeFromParent()
            this.entity = null
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