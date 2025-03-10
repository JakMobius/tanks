import PhysicsChunk from "src/physics/physics-chunk";
import TilemapComponent from "src/map/tilemap-component";
import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import {squareQuadrangle, transformQuadrangle, translateQuadrangle, turnQuadrangle} from "src/utils/quadrangle";
import PhysicalHostComponent from "src/entity/components/physical-host-component";
import ChunkedMapCollider from "src/physics/chunked-map-collider";
import TransformComponent from "src/entity/components/transform-component";
import Entity from "src/utils/ecs/entity";
import * as Box2D from "@box2d/core"
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import B2DebugDraw from "src/client/graphics/drawers/b2-debug-draw";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import LineDrawer from "src/client/graphics/drawers/line-drawer";

export default class MapDebugDrawer {
    private readonly drawPhase: DrawPhase;
    private world: Entity;

    // ABGR
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
        // this.b2DebugDraw.SetFlags(Box2D.b2DrawFlags.e_shapeBit)
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
                worldSpaceShape.push((point[0] + chunk.x))
                worldSpaceShape.push((point[1] + chunk.y))
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
            chunk.x, chunk.y,
            (chunk.x + chunk.width), chunk.y,
            (chunk.x + chunk.width), (chunk.y + chunk.height),
            chunk.x, (chunk.y + chunk.height)
        ], MapDebugDrawer.chunkBorderColor, MapDebugDrawer.meshStrokeThickness, true)

        let dotRadius = MapDebugDrawer.vertexSize / 2

        for(let shape of edgeMesh) {
            for(let point of shape) {
                let x = (point[0] + chunk.x)
                let y = (point[1] + chunk.y)

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
        const physicsComponent = this.world.getComponent(PhysicalHostComponent)
        const world = physicsComponent.world

        // Draw whatever you want here:
        Box2D.DrawShapes(this.b2DebugDraw, world /*, aabb */);
        Box2D.DrawJoints(this.b2DebugDraw, world);
        // Box2D.DrawAABBs(this.b2DebugDraw, world /*, aabb */);
        // Box2D.DrawPairs(this.b2DebugDraw, world);
        Box2D.DrawCenterOfMasses(this.b2DebugDraw, world);
    }

    private drawTankWheelDebug(entity: Entity) {
        const behaviour = entity.getComponent(TankWheelsComponent)
        const transform = entity.getComponent(TransformComponent).getTransform()

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