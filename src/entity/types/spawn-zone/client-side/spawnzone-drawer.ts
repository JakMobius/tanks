import DrawPhase from "src/client/graphics/drawers/draw-phase";
import EntityDrawer from "src/client/graphics/drawers/entity-drawer";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import SpawnzoneComponent from "../spawnzone-component";
import TeamColor from "src/utils/team-color";
import TransformComponent from "src/entity/components/transform/transform-component";
import LineDrawer from "src/client/graphics/drawers/line-drawer";

export default class SpawnzoneDrawer extends EntityDrawer {
    
    static mortarBallColor = 0xFF444444
    static vertices = [
        -1, -1,
        -1, 1,
        1, 1,
        1, -1
    ]

    draw(phase: DrawPhase) {
        const program = phase.getProgram(ConvexShapeProgram)
        const spawnzone = this.entity.getComponent(SpawnzoneComponent)
        const transform = this.entity.getComponent(TransformComponent)

        let teamColor = TeamColor.getColor(spawnzone.team).getUint32()

        // Set alpha to 0.5
        let backgroundColor = (teamColor & ~0xFF000000) | 0x70000000
        let strokeColor = teamColor

        let matrix = transform.getGlobalTransform()

        let shape = []

        for(let i = 0; i < SpawnzoneDrawer.vertices.length; i += 2) {
            let x = SpawnzoneDrawer.vertices[i]
            let y = SpawnzoneDrawer.vertices[i + 1]
            shape.push(matrix.transformX(x, y))
            shape.push(matrix.transformY(x, y))
        }

        program.drawConvexShape(shape, backgroundColor)
        LineDrawer.strokeShape(phase, shape, strokeColor, 0.06, true)
    }
}