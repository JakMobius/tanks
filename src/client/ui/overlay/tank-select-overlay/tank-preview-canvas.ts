import Screen from "src/client/graphics/screen";
import View from "src/client/ui/view";
import GameProgramPool from "src/client/graphics/game-program-pool";
import ProgramPool from "src/client/graphics/program-pool";
import Entity from "src/utils/ecs/entity";
import {gameWorldEntityPrefab} from "src/entity/game-world-entity-prefab";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import Sprite from "src/client/graphics/sprite";
import TilemapComponent from "src/physics/tilemap-component";
import GameMap from "src/map/game-map";
import ParticleHostComponent from "src/client/entity/components/particle-host-component";
import PhysicalComponent from "src/entity/components/physics-component";
import CameraPositionController from "src/entity/components/camera-position-controller";
import CameraComponent from "src/client/graphics/camera";

export default class TankPreviewCanvas extends View {
    screen: Screen
    camera: Entity
    programPool: ProgramPool
    drawPhase: DrawPhase

    tank = new Entity()
    world = new Entity()

    time = 0

    constructor() {
        super()
        this.element.addClass("tank-preview-canvas");

        this.screen = new Screen({
            root: this.element,
            fitRoot: false,
            width: 146,
            height: 139,
            withSound: false
        })

        this.camera = new Entity()
        this.camera.addComponent(new CameraComponent())
        this.camera.addComponent(new CameraPositionController()
            .setViewport({x: this.screen.width, y: this.screen.height})
            .setBaseScale(12)
            .setDefaultPosition({x: 0, y: 0}))

        this.programPool = new GameProgramPool(this.camera.getComponent(CameraComponent), this.screen.ctx)
        this.drawPhase = new DrawPhase(this.programPool)

        Sprite.applyTexture(this.screen.ctx)

        // Disable Box2D stepping, as we are not using much physics
        // for this canvas.

        gameWorldEntityPrefab(this.world, {
            physicsTick: 1 / 60,
            iterations: {
                positionIterations: 0,
                velocityIterations: 0
            }
        })

        this.world.getComponent(TilemapComponent).setMap(new GameMap({
            width: 0,
            height: 0,
            data: []
        }))
        this.world.addComponent(new ParticleHostComponent())
    }

    draw(dt: number) {
        // this.world.emit("tick", dt)

        // this.drawPhase.prepare()
        // this.world.emit("draw")
        // this.drawPhase.runPrograms()
    }

    setTankType(type: number) {
        this.tank.removeFromParent()
        this.tank = new Entity()
        ClientEntityPrefabs.types.get(type)(this.tank)
        this.world.appendChild(this.tank)
    }

    onFrame(dt: number) {
        this.time += dt
        let component = this.tank.getComponent(PhysicalComponent)
        component.setPositionAngle(component.getBody().GetPosition(), this.time)
        this.draw(dt)
    }
}