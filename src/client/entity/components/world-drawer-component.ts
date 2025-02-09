import Screen from 'src/client/graphics/screen'
import MapDebugDrawer from "src/client/graphics/drawers/map-debug-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import Entity from "src/utils/ecs/entity";
import GameProgramPool from "src/client/graphics/game-program-pool";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import UIDebugDrawer from "src/client/graphics/drawers/ui-debug-drawer";
import CameraComponent from "src/client/graphics/camera";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";

export default class WorldDrawerComponent extends EventHandlerComponent {
    public screen: Screen
    public programPool: GameProgramPool
    public debugDrawer: MapDebugDrawer
    public uiDebugDrawer: UIDebugDrawer
    public debugDrawOn: boolean = false

    public backgroundDrawPhase: DrawPhase
    public mapDrawPhase: DrawPhase
    public entityDrawPhase: DrawPhase
    public particleDrawPhase: DrawPhase
    public debugDrawPhase: DrawPhase
    public debugUIDrawPhase: DrawPhase

    static depths = {
        mine: 0.10,
        tankTrack: 0.09,
        tankBody: 0.08,
        bullet: 0.07,
        tankTop: 0.06,
        block: 0.05,
        blockCrack: 0.04,
        overlay: 0.03,
    }
    world: Entity | null = null
    worldEventHandler = new BasicEventHandlerSet()

    constructor(screen: Screen) {
        super()

        this.screen = screen
        this.world = null

        this.worldEventHandler.on("draw", () => this.draw())

        this.eventHandler.on("attached-to-parent", (parent) => {
            this.onWorldChange()
        })

        this.eventHandler.on("detached-from-parent", (parent) => {
            this.onWorldChange()
        })
    }

    draw() {
        this.backgroundDrawPhase.draw()
        this.mapDrawPhase.draw()
        this.entityDrawPhase.draw()
        this.particleDrawPhase.draw()

        if (this.debugDrawOn) {
            this.debugDrawer.draw()
            this.uiDebugDrawer.draw()
        }
    }

    onWorldChange() {
        this.world = this.entity.parent
        this.debugDrawer?.setWorld(this.world)
        this.worldEventHandler.setTarget(this.world)
    }

    onAttach(entity: Entity): void {
        super.onAttach(entity)

        let camera = this.entity.getComponent(CameraComponent)

        this.programPool = new GameProgramPool(camera, this.screen.ctx)

        this.backgroundDrawPhase = new DrawPhase(this.programPool)
        this.mapDrawPhase = new DrawPhase(this.programPool)
        this.entityDrawPhase = new DrawPhase(this.programPool)
        this.particleDrawPhase = new DrawPhase(this.programPool)
        this.debugDrawPhase = new DrawPhase(this.programPool)
        this.debugUIDrawPhase = new DrawPhase(this.programPool)

        this.debugDrawer = new MapDebugDrawer(this.debugDrawPhase)
        this.uiDebugDrawer = new UIDebugDrawer(this.screen, camera, this.debugUIDrawPhase)

        this.onWorldChange()
    }

    toggleDebugDraw() {
        this.debugDrawOn = !this.debugDrawOn
    }
}