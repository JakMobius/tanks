
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import CanvasHandler from 'src/client/graphics/canvas-handler';
import MapDebugDrawer from "src/entity/types/tilemap/client-side/map-debug-drawer";
import { GameProgramPool, UIProgramPool } from "src/client/graphics/program-pools";
import CameraComponent from "src/client/graphics/camera";

export default class WorldDrawerComponent extends EventHandlerComponent {
    public canvasHandler: CanvasHandler
    public programPool: GameProgramPool
    public uiProgramPool: UIProgramPool
    public debugDrawer: MapDebugDrawer
    public debugDrawOn: boolean = false

    public backgroundDrawPhase: DrawPhase
    public mapDrawPhase: DrawPhase
    public entityDrawPhase: DrawPhase
    public particleDrawPhase: DrawPhase
    public debugDrawPhase: DrawPhase
    public uiDrawPhase: DrawPhase

    world: Entity | null = null
    worldEventHandler = new BasicEventHandlerSet()

    constructor(canvasHandler: CanvasHandler) {
        super()

        this.canvasHandler = canvasHandler
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
        if(this.canvasHandler.needsResize) {
            this.canvasHandler.updateSize()
        }
        this.entity.getComponent(CameraComponent)
            .setViewport({ x: this.canvasHandler.width, y: this.canvasHandler.height })
            
        this.canvasHandler.clear()

        this.backgroundDrawPhase.draw()
        this.mapDrawPhase.draw()
        this.entityDrawPhase.draw()
        this.particleDrawPhase.draw()

        if (this.debugDrawOn) {
            this.debugDrawer.draw()
        }

        this.uiDrawPhase.draw()
    }

    onWorldChange() {
        this.world = this.entity.parent
        this.debugDrawer?.setWorld(this.world)
        this.worldEventHandler.setTarget(this.world)
    }

    onAttach(entity: Entity): void {
        super.onAttach(entity)

        this.programPool = new GameProgramPool(this.entity, this.canvasHandler.ctx)
        this.uiProgramPool = new UIProgramPool(this.entity, this.canvasHandler.ctx)

        this.backgroundDrawPhase = new DrawPhase(this.entity, this.programPool)
        this.mapDrawPhase = new DrawPhase(this.entity, this.programPool)
        this.entityDrawPhase = new DrawPhase(this.entity, this.programPool)
        this.particleDrawPhase = new DrawPhase(this.entity, this.programPool)
        this.debugDrawPhase = new DrawPhase(this.entity, this.programPool)
        this.uiDrawPhase = new DrawPhase(this.entity, this.uiProgramPool)

        this.debugDrawer = new MapDebugDrawer(this.debugDrawPhase)

        this.onWorldChange()
    }

    toggleDebugDraw() {
        this.debugDrawOn = !this.debugDrawOn
    }
}