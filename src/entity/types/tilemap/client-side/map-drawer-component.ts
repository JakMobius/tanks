import {Constructor} from "src/utils/constructor"
import BlockState from "src/map/block-state/block-state";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import Entity from "src/utils/ecs/entity";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import TextureProgram from "src/client/graphics/programs/texture-program";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import TilemapComponent from "src/map/tilemap-component";
import BlockDrawer from "src/client/graphics/drawers/block/block-drawer";
import TransformComponent from "src/entity/components/transform/transform-component";
import { clamp } from "src/utils/utils";

export interface DrawerBounds {
    x0: number
    x1: number
    y0: number
    y1: number
}

export default class MapDrawerComponent extends EventHandlerComponent {

    bounds: DrawerBounds = {
        x0: null, x1: null, y0: null, y1: null
    }

    backgroundDrawCallback = (phase: DrawPhase) => this.drawGrid(phase)
    mapDrawCallback = (phase: DrawPhase) => this.drawMap(phase)

    constructor() {
        super()

        this.eventHandler.on("camera-attach", (camera: Entity) => {
            camera.getComponent(WorldDrawerComponent).backgroundDrawPhase.on("draw", this.backgroundDrawCallback)
            camera.getComponent(WorldDrawerComponent).mapDrawPhase.on("draw", this.mapDrawCallback)
        })

        this.eventHandler.on("camera-detach", (camera: Entity) => {
            camera.getComponent(WorldDrawerComponent).backgroundDrawPhase.off("draw", this.backgroundDrawCallback)
            camera.getComponent(WorldDrawerComponent).mapDrawPhase.off("draw", this.mapDrawCallback)
        })
    }

    private updateBounds(map: TilemapComponent, camera: Entity) {
        const cameraTransform = camera.getComponent(TransformComponent)
        const tilemap = this.entity.getComponent(TilemapComponent)
        const inverseTransform = this.entity.getComponent(TransformComponent).getInvertedGlobalTransform()
        const cameraMatrix = cameraTransform.getGlobalTransform()

        let x0 = Infinity
        let y0 = Infinity
        let x1 = -Infinity
        let y1 = -Infinity

        // Calculate visible AABB
        for (let sx = -1; sx <= 1; sx += 2) {
            for (let sy = -1; sy <= 1; sy += 2) {
                let gx = cameraMatrix.transformX(sx, sy)
                let gy = cameraMatrix.transformY(sx, sy)

                let x = inverseTransform.transformX(gx, gy)
                let y = inverseTransform.transformY(gx, gy)

                x0 = Math.min(x0, x)
                y0 = Math.min(y0, y)
                x1 = Math.max(x1, x)
                y1 = Math.max(y1, y)
            }
        }

        const maxWidth = map.width;
        const maxHeight = map.height;

        this.bounds.x0 = clamp(tilemap.localToBlockX(x0), 0, maxWidth)
        this.bounds.y0 = clamp(tilemap.localToBlockY(y0), 0, maxHeight)
        this.bounds.x1 = clamp(tilemap.localToBlockX(x1) + 1, 0, maxWidth)
        this.bounds.y1 = clamp(tilemap.localToBlockY(y1) + 1, 0, maxHeight)
    }

    private drawMap(phase: DrawPhase) {
        let program = phase.getProgram(TextureProgram)
        let map = this.entity.getComponent(TilemapComponent)
        let tilemap = this.entity.getComponent(TilemapComponent)
        if (!map) return

        program.transform.save()
        program.transform.multiply(this.entity.getComponent(TransformComponent).getGlobalTransform())
        program.transform.translate(-tilemap.localToBlockX(0), -tilemap.localToBlockY(0))

        this.updateBounds(map, phase.camera)

        for (let x = this.bounds.x0; x <= this.bounds.x1; x++) {
            for (let y = this.bounds.y0; y <= this.bounds.y1; y++) {
                const block = map.getBlock(x, y);

                if (block) this.drawBlock(program, block, x, y, map)
            }
        }

        program.transform.restore()
    }

    private drawBlock(program: TextureProgram, block: BlockState, x: number, y: number, map: TilemapComponent) {
        let id = (block.constructor as typeof BlockState).typeId

        if (id === 0) return

        let drawer = MapDrawerComponent.RegisteredDrawers.get(id)

        if (drawer) {
            drawer.draw(program, x, y, block, map)
        }
    }

    private drawGrid(phase: DrawPhase) {
        let program = phase.getProgram(ConvexShapeProgram)
        let tilemap = this.entity.getComponent(TilemapComponent)
        let map = this.entity.getComponent(TilemapComponent)
        if (!map) return

        program.transform.save()
        program.transform.multiply(this.entity.getComponent(TransformComponent).getGlobalTransform())
        program.transform.translate(tilemap.blockToLocalX(0), tilemap.blockToLocalX(0))

        this.updateBounds(map, phase.camera)

        const gridColor = 0xffe6e6e6

        let gridThickness = 0.04
        let halfGridThickness = gridThickness / 2

        for (let x = this.bounds.x0; x <= this.bounds.x1; x++) {
            if (x != 0 && x != map.width) {
                this.drawLine(program, x - halfGridThickness, 0, gridThickness, this.bounds.y1, gridColor)
            }
        }

        for (let y = this.bounds.y0; y <= this.bounds.y1; y++) {
            if (y != 0 && y != map.height) {
                this.drawLine(program, 0, y - halfGridThickness, this.bounds.x1, gridThickness, gridColor)
            }
        }

        const borderColor = 0xffd4d4d4
        let borderThickness = 0.06
        let halfBorderThickness = borderThickness / 2

        this.drawLine(program, -halfBorderThickness, 0, borderThickness, this.bounds.y1, borderColor)
        this.drawLine(program, 0, -halfBorderThickness, this.bounds.x1, borderThickness, borderColor)
        this.drawLine(program, map.width - halfBorderThickness, 0, borderThickness, this.bounds.y1, borderColor)
        this.drawLine(program, 0, map.height - halfBorderThickness, this.bounds.x1, borderThickness, borderColor)

        program.transform.restore()
    }

    private drawLine(program: ConvexShapeProgram, x0: number, y0: number, width: number, height: number, color: number) {
        program.drawRectangle(x0, y0, x0 + width, y0 + height, color)
    }

    static registerBlockLoader(id: number, drawer: Constructor<BlockDrawer>) {
        this.RegisteredDrawers.set(id, drawer)
    }

    static RegisteredDrawers = new Map()
}