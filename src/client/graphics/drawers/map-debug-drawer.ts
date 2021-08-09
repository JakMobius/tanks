import ClientGameWorld from "../../client-game-world";
import PhysicsChunk from "../../../physics/physics-chunk";
import GameMap from "../../../map/gamemap";
import LineDrawer from "./line-drawer";
import DrawPhase from "./draw-phase";
import ConvexShapeProgram from "../programs/convex-shapes/convex-shape-program";
import B2DebugDraw from "./b2-debug-draw";
import {b2DrawFlags} from "../../../library/box2d/common/b2_draw";

export default class MapDebugDrawer {
    private readonly drawPhase: DrawPhase;
    private world: ClientGameWorld;

    static chunkBorderColor = 0xFFDD22DD
    static meshFillColor = 0x800000FF
    static meshStrokeColor = 0xFF0000FF
    static meshVertexColor = 0xFF00DD00
    static vertexSize = 1.5
    static meshStrokeThickness = 1;
    private b2DebugDraw: B2DebugDraw;

    constructor(drawPhase: DrawPhase) {
        this.drawPhase = drawPhase
        this.b2DebugDraw = new B2DebugDraw(drawPhase)
        this.b2DebugDraw.SetFlags(b2DrawFlags.e_shapeBit)
    }

    setWorld(world: ClientGameWorld) {
        this.world = world
    }

    draw() {
        this.drawPhase.prepare()
        //this.drawChunksDebug()
        this.drawB2Debug()
        this.drawPhase.draw()
    }

    private drawChunksDebug() {
        let chunkManager = this.world.physicsChunkManager

        for(let row of chunkManager.chunkMap.rows.values()) {
            for(let chunk of row.values()) {
                this.drawChunkDebug(chunk)
            }
        }
    }

    private drawChunkDebug(chunk: PhysicsChunk) {
        let edgeMesh = chunk.edgeMesh
        let transformedMesh = []

        for(let shape of edgeMesh) {
            let worldSpaceShape = []
            for(let point of shape) {
                worldSpaceShape.push((point[0] + chunk.x) * GameMap.BLOCK_SIZE)
                worldSpaceShape.push((point[1] + chunk.y) * GameMap.BLOCK_SIZE)
            }
            transformedMesh.push(worldSpaceShape)
        }

        let convexShapeProgram = this.drawPhase.getProgram(ConvexShapeProgram)

        for(let shape of transformedMesh) {
            convexShapeProgram.drawConvexShape(shape, MapDebugDrawer.meshFillColor)
        }

        for(let shape of transformedMesh) {
            LineDrawer.strokeShape(this.drawPhase, shape, MapDebugDrawer.meshStrokeColor, MapDebugDrawer.meshStrokeThickness, true)
        }

        LineDrawer.strokeShape(this.drawPhase,[
            chunk.x * GameMap.BLOCK_SIZE, chunk.y * GameMap.BLOCK_SIZE,
            (chunk.x + chunk.width) * GameMap.BLOCK_SIZE, chunk.y * GameMap.BLOCK_SIZE,
            (chunk.x + chunk.width) * GameMap.BLOCK_SIZE, (chunk.y + chunk.height) * GameMap.BLOCK_SIZE,
            chunk.x * GameMap.BLOCK_SIZE, (chunk.y + chunk.height) * GameMap.BLOCK_SIZE
        ], MapDebugDrawer.chunkBorderColor, MapDebugDrawer.meshStrokeThickness, true)

        let dotRadius = MapDebugDrawer.vertexSize / 2

        for(let shape of edgeMesh) {
            for(let point of shape) {
                let x = (point[0] + chunk.x) * GameMap.BLOCK_SIZE
                let y = (point[1] + chunk.y) * GameMap.BLOCK_SIZE

                convexShapeProgram.drawConvexShape([
                    x - dotRadius, y - dotRadius,
                    x + dotRadius, y - dotRadius,
                    x + dotRadius, y + dotRadius,
                    x - dotRadius, y + dotRadius
                ], MapDebugDrawer.meshVertexColor)
            }
        }
    }

    private drawB2Debug() {
        this.world.world.SetDebugDraw(this.b2DebugDraw)
        this.world.world.DebugDraw()
    }
}