import PhysicsChunk from "src/physics/physics-chunk";
import GameMap from "src/map/game-map";
import LineDrawer from "./line-drawer";
import DrawPhase from "./draw-phase";
import ConvexShapeProgram from "../programs/convex-shapes/convex-shape-program";
import B2DebugDraw from "./b2-debug-draw";
import {b2DrawFlags} from "src/library/box2d/common/b2_draw";
import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import {squareQuadrangle, transformQuadrangle, translateQuadrangle, turnQuadrangle} from "src/utils/quadrangle";
import PhysicalHostComponent from "src/entity/components/physical-host-component";
import ChunkedMapCollider from "src/physics/chunked-map-collider";
import TransformComponent from "src/entity/components/transform-component";
import Entity from "src/utils/ecs/entity";
import DebugDrawer from "src/client/graphics/drawers/debug-drawer/debug-drawer";

export default class MapDebugDrawer {
    private readonly drawPhase: DrawPhase;
    private world: Entity;

    // ARGB
    static chunkBorderColor = 0xFFDD22DD
    static meshFillColor = 0x800000FF
    static meshStrokeColor = 0xFF0000FF
    static meshVertexColor = 0xFF00DD00
    static wheelColor = 0xAAFF00FF
    static slidingWheelColor = 0xAAFF0000
    static vertexSize = 0.375
    static meshStrokeThickness = 0.25;
    static wheelSize = 0.25
    private b2DebugDraw: B2DebugDraw;

    constructor(drawPhase: DrawPhase) {
        this.drawPhase = drawPhase
        this.b2DebugDraw = new B2DebugDraw(drawPhase)
        this.b2DebugDraw.SetFlags(b2DrawFlags.e_shapeBit)
    }

    setWorld(world: Entity) {
        this.world = world
    }

    draw() {
        this.drawPhase.prepare()
        // this.drawChunksDebug()
        this.drawB2Debug()
        this.drawTanksWheelDebug()
        this.drawPhase.runPrograms()
    }

    private drawChunksDebug() {
        let chunkManager = this.world.getComponent(ChunkedMapCollider)

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

    private drawTanksWheelDebug() {
        for(let entity of this.world.children) {
            let behaviourComponent = entity.getComponent(TankWheelsComponent)
            if(behaviourComponent) {
                this.drawTankWheelDebug(entity)
            }
        }
    }

    private drawB2Debug() {
        this.world.getComponent(PhysicalHostComponent).world.SetDebugDraw(this.b2DebugDraw)
        this.world.getComponent(PhysicalHostComponent).world.DebugDraw()
    }

    private drawTankWheelDebug(entity: Entity) {
        const behaviour = entity.getComponent(TankWheelsComponent)
        const transform = entity.getComponent(TransformComponent).transform

        if(!behaviour) return

        let wheels = behaviour.getWheelGroups()

        let convexShapeProgram = this.drawPhase.getProgram(ConvexShapeProgram)
        let wheelSize = MapDebugDrawer.wheelSize

        for(let wheelGroup of wheels) {
            for(let wheel of wheelGroup.wheels) {
                let wheelQuadrangle = squareQuadrangle(-wheelSize / 2, -wheelSize / 2, wheelSize, wheelSize)

                turnQuadrangle(wheelQuadrangle, Math.sin(wheel.angle), Math.cos(wheel.angle))
                translateQuadrangle(wheelQuadrangle, wheel.x, wheel.y)
                transformQuadrangle(wheelQuadrangle, transform)

                let color = wheel.slideVelocity > 0 ? MapDebugDrawer.slidingWheelColor : MapDebugDrawer.wheelColor

                convexShapeProgram.drawQuadrangle(wheelQuadrangle, color)
            }
        }
    }
}