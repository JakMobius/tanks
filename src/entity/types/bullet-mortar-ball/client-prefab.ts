import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import * as Box2D from "@box2d/core";
import EntityDrawer from "src/client/graphics/drawers/entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import TransformComponent from "src/entity/components/transform/transform-component";
import MortarBallHeightComponent from "./mortar-ball-height-component";
import MortarBallHeightReceiver from "./mortar-ball-height-receiver";

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

ClientEntityPrefabs.types.set(EntityType.BULLET_MORTAR_BALL, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_MORTAR_BALL)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)

    entity.on("should-collide", (body: Box2D.b2Body) => false)

    entity.addComponent(new MortarBallHeightComponent())
    entity.addComponent(new MortarBallHeightReceiver())
    entity.addComponent(new ClientBulletBehaviourComponent())
    entity.addComponent(new Drawer())
})