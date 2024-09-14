import EntityDrawer from "src/client/graphics/drawers/entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import MortarBallHeightComponent from "src/entity/components/network/mortar-ball-height/mortar-ball-height-component";
import TransformComponent from "src/entity/components/transform-component";

export class Drawer extends EntityDrawer {
    static circleMesh = (() => {
        let segments = 48
        let vertices = []

        for (let i = 0; i < segments; i++) {
            let angle = i / segments * Math.PI * 2
            vertices.push(Math.cos(angle))
            vertices.push(Math.sin(angle))
        }

        return vertices
    })()

    static mortarBallColor = 0xFF444444
    private vertices: number[] = new Array(Drawer.circleMesh.length).fill(0)

    private updateVertices(x: number, y: number, radius: number) {
        for (let i = 0; i < Drawer.circleMesh.length; i += 2) {
            this.vertices[i] = (Drawer.circleMesh[i] * radius + x)
            this.vertices[i + 1] = (Drawer.circleMesh[i + 1] * radius + y)
        }
    }

    draw(phase: DrawPhase) {
        if (!this.entity.getComponent(ClientBulletBehaviourComponent).visible) return

        const program = phase.getProgram(ConvexShapeProgram)

        const heightComponent = this.entity.getComponent(MortarBallHeightComponent)
        const position = this.entity.getComponent(TransformComponent).getPosition()
        const height = heightComponent.height

        const radius = 0.4 + height / 2

        this.updateVertices(position.x, position.y, radius)
        program.drawConvexShape(this.vertices, Drawer.mortarBallColor)
    }
}