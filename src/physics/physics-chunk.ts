
import PhysicsChunkManager, {PhysicsPoint} from "./physics-chunk-manager";
import * as Box2D from "../library/box2d"
import {PhysicsBlock} from "./physics-block";
import {epsilon, signedDoubleTriangleSurface} from "../utils/utils";
import EdgeFindingContext from "./edge-finding-context";
import {MeshGenerationContext} from "./mesh-generation-context";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import {b2BodyType} from "../library/box2d/dynamics/b2_body";
import GameMap from "../map/game-map";
import {physicsCategories, physicsMasks} from "./categories";

export default class PhysicsChunk {
    public readonly manager: PhysicsChunkManager;
    public readonly x: number;
    public readonly y: number;
    public readonly width: number;
    public readonly height: number;
    private body: Box2D.Body | null = null
    public blocks: PhysicsBlock[] | null = null
    private edgeFindingContext: EdgeFindingContext;
    private meshGenerationContext: MeshGenerationContext;
    private eventHandlers: BasicEventHandlerSet;
    needsUpdate: boolean = false
    lastRelevanceTime: number = 0
    edgePaths: PhysicsPoint[][];
    edgeMesh: PhysicsPoint[][];

    constructor(manager: PhysicsChunkManager, x: number, y: number) {
        this.manager = manager
        this.x = x
        this.y = y
        this.width = this.manager.chunkWidth
        this.height = this.manager.chunkHeight
        this.edgeFindingContext = new EdgeFindingContext(this)
        this.meshGenerationContext = new MeshGenerationContext(this)

        this.eventHandlers = new BasicEventHandlerSet()
        this.eventHandlers.on("map-block-change", (x, y) => this.onBlockUpdate(x, y))
    }

    onBlockUpdate(x: number, y: number) {
        let localX = x - this.x
        let localY = y - this.y

        if(localX >= 0 && localY >= 0 && localX < this.width && localY < this.height) {
            this.blocks[localX + localY * this.width].updateBlock(this.manager.world.map.getBlock(x, y))
            this.needsUpdate = true
        }
    }

    listen() {
        this.eventHandlers.setTarget(this.manager.world)
        this.needsUpdate = true
    }

    destroy() {
        this.eventHandlers.setTarget(null)
        this.removeBody()
    }

    private loadBlocks() {
        this.blocks = new Array(this.width * this.height)
        for(let y = this.y, dy = 0, i = 0; dy < this.height; y++, dy++) {
            for(let x = this.x, dx = 0; dx < this.width; x++, dx++, i++) {
                this.blocks[i] = new PhysicsBlock(this.manager.world.map.getBlock(x, y))
            }
        }
    }

    private generateMesh() {
        this.edgePaths = this.edgeFindingContext.findPaths()
        this.edgeMesh = this.meshGenerationContext.generateMesh(this.edgePaths)
    }

    public updateBody() {
        if(!this.blocks) this.loadBlocks()

        if(this.body) {
            this.body.GetWorld().DestroyBody(this.body)
        }

        const body = this.manager.world.world.CreateBody({
            type: b2BodyType.b2_staticBody,
            position: { x: this.x * GameMap.BLOCK_SIZE, y: this.y * GameMap.BLOCK_SIZE },
        })

        this.generateMesh()
        for(let shape of this.edgeMesh) {
            const pointShape = shape.map(point => ({ x: point[0] * GameMap.BLOCK_SIZE, y: point[1] * GameMap.BLOCK_SIZE }))

            body.CreateFixture({
                shape: new Box2D.PolygonShape().Set(pointShape),
                density: 1.0,
                friction: 0.1,
                restitution: 0.5,
                filter: {
                    categoryBits: physicsCategories.wall,
                    maskBits: physicsMasks.wall
                }
            })
        }

        if(this.body) this.body.SetUserData(null)
        this.body = body
        this.body.SetUserData(this)
        this.needsUpdate = false
    }

    getBlock(x: number, y: number) {
        if(x < 0 || x >= this.width || y < 0 || y >= this.height) {
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

        for(let edge of block.edges) {
            let surface = signedDoubleTriangleSurface(fromX, fromY, edge.getSourceX() + blockX, edge.getSourceY() + blockY, toX, toY)
            if(surface > epsilon) return 1
            if(surface < -epsilon) return -1

            surface = signedDoubleTriangleSurface(fromX, fromY, edge.getTargetX() + blockX, edge.getTargetY() + blockY, toX, toY)
            if(surface > epsilon) return 1
            if(surface < -epsilon) return -1
        }

        return 0
    }

    private removeBody() {
        if(this.body) {
            this.body.GetWorld().DestroyBody(this.body)
            this.body = null
        }
    }

    setRelevant() {
        this.lastRelevanceTime = this.manager.time
    }
}