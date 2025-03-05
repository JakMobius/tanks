import {TwoDimensionalMap} from "../utils/two-dimensional-map";
import PhysicsChunk from "./physics-chunk";
import PhysicalHostComponent from "src/entity/components/physical-host-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import TilemapComponent from "../map/tilemap-component";
import { WorldComponent } from "src/entity/game-world-entity-prefab";

export interface PhysicsChunkManagerConfig {
    chunkWidth?: number
    chunkHeight?: number
}

// According to benchmarks, arrays are fastest to create,
// so we use them to represent points.
export type PhysicsPoint = [number, number]

export default class ChunkedMapCollider extends EventHandlerComponent {
    public readonly chunkWidth: number;
    public readonly chunkHeight: number
    public time: number = 0

    chunkMap = new TwoDimensionalMap<number, number, PhysicsChunk>()
    private readonly relevanceRadius: number;
    private readonly relevanceDuration: number;

    private mapComponent?: TilemapComponent

    constructor(config: PhysicsChunkManagerConfig = {}) {
        super()
        config = Object.assign({
            chunkWidth: 16,
            chunkHeight: 16
        }, config)

        this.chunkWidth = config.chunkWidth
        this.chunkHeight = config.chunkHeight

        this.eventHandler.on("map-change", () => this.resetChunks())
        this.eventHandler.on("tick", (dt) => this.updateChunks(dt))

        this.relevanceRadius = 6
        this.relevanceDuration = 1.0 // in seconds
    }

    getMap() {
        if(!this.mapComponent || this.mapComponent.entity != this.entity) {
            this.mapComponent = this.entity.getComponent(TilemapComponent)
        }
        return this.mapComponent
    }

    getChunk(x: number, y: number): PhysicsChunk {
        let currentChunk = this.chunkMap.get(x, y)
        if(currentChunk !== null) return currentChunk
        return this.createChunk(x, y)
    }

    private createChunk(x: number, y: number) {
        let chunk = new PhysicsChunk(this, x, y)
        this.chunkMap.set(x, y, chunk)
        chunk.listen()

        return chunk
    }

    private unloadChunk(chunk: PhysicsChunk) {
        chunk.destroy()
        this.chunkMap.delete(chunk.x, chunk.y)
    }

    private resetChunks() {
        for(let row of this.chunkMap.rows.values()) {
            for(let chunk of row.values()) {
                chunk.destroy()
            }
        }
        this.chunkMap.clear()
    }

    private updateChunks(dt: number) {
        this.time += dt
        const world = WorldComponent.getWorld(this.entity)
        const physicalComponents = world.getComponent(PhysicalHostComponent).physicalComponents

        for(let component of physicalComponents) {
            let position = component.getBody().GetPosition()
            this.makeNearbyChunksRelevant(position.x / TilemapComponent.BLOCK_SIZE, position.y / TilemapComponent.BLOCK_SIZE)
        }

        for(let row of this.chunkMap.rows.values()) {
            for(let chunk of row.values()) {
                if(!this.isChunkRelevant(chunk)) {
                    this.unloadChunk(chunk)
                } else if(chunk.needsUpdate) {
                    chunk.updateBody()
                }
            }
        }
    }

    private makeNearbyChunksRelevant(x: number, y: number) {
        let topLeftRelevantChunkX = Math.floor((x - this.relevanceRadius) / this.chunkWidth)
        let topLeftRelevantChunkY = Math.floor((y - this.relevanceRadius) / this.chunkWidth)
        let bottomRightRelevantChunkX = Math.floor((x + this.relevanceRadius) / this.chunkHeight)
        let bottomRightRelevantChunkY = Math.floor((y + this.relevanceRadius) / this.chunkHeight)

        for(let chunkY = topLeftRelevantChunkY; chunkY <= bottomRightRelevantChunkY; chunkY++) {
            for(let chunkX = topLeftRelevantChunkX; chunkX <= bottomRightRelevantChunkX; chunkX++) {
                this.getChunk(chunkX * this.chunkWidth, chunkY * this.chunkHeight).setRelevant()
            }
        }
    }

    private isChunkRelevant(chunk: PhysicsChunk) {
        return chunk.lastRelevanceTime > this.time - this.relevanceDuration
    }

    onDetach() {
        super.onDetach()
        this.resetChunks()
    }
}