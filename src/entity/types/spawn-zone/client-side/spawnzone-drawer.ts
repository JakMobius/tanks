import DrawPhase from "src/client/graphics/drawers/draw-phase";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import SpawnzoneComponent from "../spawnzone-component";
import TeamColor from "src/utils/team-color";
import TransformComponent from "src/entity/components/transform/transform-component";
import LineDrawer from "src/client/graphics/drawers/line-drawer";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import Entity from "src/utils/ecs/entity";
import CameraComponent from "src/client/graphics/camera";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import ArrowDrawer from "src/client/graphics/drawers/arrow-drawer";

export default class SpawnzoneDrawer extends EventHandlerComponent {
    
    static vertices = [
        -1, -1,
        -1, 1,
        1, 1,
        1, -1
    ]
    
    focused = false;
    uiDrawCallback = (phase: DrawPhase) => this.uiDraw(phase)
    entityDrawCallback = (phase: DrawPhase) => this.entityDraw(phase)
    
    constructor() {
        super()
        this.eventHandler.on("camera-attach", (camera: Entity) => {
            camera.getComponent(WorldDrawerComponent).uiDrawPhase.on("draw", this.uiDrawCallback)
            camera.getComponent(WorldDrawerComponent).entityDrawPhase.on("draw", this.entityDrawCallback)
        })

        this.eventHandler.on("camera-detach", (camera: Entity) => {
            camera.getComponent(WorldDrawerComponent).uiDrawPhase.off("draw", this.uiDrawCallback)
            camera.getComponent(WorldDrawerComponent).entityDrawPhase.off("draw", this.entityDrawCallback)
        })

        this.eventHandler.on("editor-focus", () => this.onFocus())
        this.eventHandler.on("editor-blur", () => this.onBlur())
    }

    onFocus() {
        this.focused = true
    }

    onBlur() {
        this.focused = false
    }

    entityDraw(phase: DrawPhase) {
        const program = phase.getProgram(ConvexShapeProgram)
        const spawnzone = this.entity.getComponent(SpawnzoneComponent)
        const transform = this.entity.getComponent(TransformComponent)

        let teamColor = TeamColor.getColor(spawnzone.team).getUint32()

        // Set alpha to 0.5
        let backgroundColor = (teamColor & ~0xFF000000) | 0x70000000

        program.transform.save()
        program.transform.set(transform.getGlobalTransform())
        program.drawConvexShape(SpawnzoneDrawer.vertices, backgroundColor)
        program.transform.restore()
    }

    uiDraw(phase: DrawPhase) {
        const spawnzone = this.entity.getComponent(SpawnzoneComponent)
        const transform = this.entity.getComponent(TransformComponent)
        const matrix = transform.getGlobalTransform()
        const cameraTransform = phase.camera.getComponent(TransformComponent)
        const cameraMatrix = cameraTransform.getInvertedGlobalTransform()
        const viewport = phase.camera.getComponent(CameraComponent).viewport

        let teamColor = TeamColor.getColor(spawnzone.team).getUint32()

        let shape = []

        for(let i = 0; i < SpawnzoneDrawer.vertices.length; i += 2) {
            let x = SpawnzoneDrawer.vertices[i]
            let y = SpawnzoneDrawer.vertices[i + 1]
            
            let gx = matrix.transformX(x, y)
            let gy = matrix.transformY(x, y)
            
            let cx = cameraMatrix.transformX(gx, gy) * viewport.x
            let cy = cameraMatrix.transformY(gx, gy) * viewport.y

            shape.push(cx, cy)
        }

        LineDrawer.strokeShape(phase, shape, teamColor, 1, true)

        if(this.focused) {
            let directionColor = 0xFFE98C0C
            let center = spawnzone.center()
            let angle = spawnzone.getGlobalSpawnAngle()

            let cx = cameraMatrix.transformX(center.x, center.y) * viewport.x
            let cy = cameraMatrix.transformY(center.x, center.y) * viewport.y

            let dirX = Math.cos(angle)
            let dirY = Math.sin(angle)
            let halfLen = 20

            ArrowDrawer.drawArrow(phase, {
                start: { x: cx - dirX * halfLen, y: cy - dirY * halfLen },
                end: { x: cx + dirX * halfLen, y: cy + dirY * halfLen },
                strokeColor: directionColor,
                headLength: 10,
                headWidth: 20,
                strokeWidth: 5
            })
        }
    }
}