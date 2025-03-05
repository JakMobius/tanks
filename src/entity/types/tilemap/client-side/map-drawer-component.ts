import {Constructor} from "src/utils/constructor"
import BlockState from "src/map/block-state/block-state";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import Entity from "src/utils/ecs/entity";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import CameraComponent from "src/client/graphics/camera";
import TextureProgram from "src/client/graphics/programs/texture-program";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import TilemapComponent from "src/map/tilemap-component";
import BlockDrawer from "src/client/graphics/drawers/block/block-drawer";
import { Transform } from "stream";
import TransformComponent from "src/entity/components/transform-component";

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

        // this.eventHandler.on("map-change", () => this.onWorldMapChanged())
        // this.eventHandler.on("map-block-update", () => this.onMapBlockUpdate())

        this.eventHandler.on("camera-attach", (camera: Entity) => {
            camera.getComponent(WorldDrawerComponent).backgroundDrawPhase.on("draw", this.backgroundDrawCallback)
            camera.getComponent(WorldDrawerComponent).mapDrawPhase.on("draw", this.mapDrawCallback)
        })

        this.eventHandler.on("camera-detach", (camera: Entity) => {
            camera.getComponent(WorldDrawerComponent).backgroundDrawPhase.off("draw", this.backgroundDrawCallback)
            camera.getComponent(WorldDrawerComponent).mapDrawPhase.off("draw", this.mapDrawCallback)
        })
    }

    private updateBounds(map: TilemapComponent, camera: CameraComponent) {
        let x0 = Infinity
        let y0 = Infinity
        let x1 = -Infinity
        let y1 = -Infinity

        // Calculate visible AABB
        for (let dx = -1; dx <= 1; dx += 2) {
            for (let dy = -1; dy <= 1; dy += 2) {
                let x = camera.inverseMatrix.transformX(dx, dy)
                let y = camera.inverseMatrix.transformY(dx, dy)

                x0 = Math.min(x0, x)
                y0 = Math.min(y0, y)
                x1 = Math.max(x1, x)
                y1 = Math.max(y1, y)
            }
        }

        const maxWidth = map.width * TilemapComponent.BLOCK_SIZE;
        const maxHeight = map.height * TilemapComponent.BLOCK_SIZE;

        this.bounds.x0 = Math.floor(Math.max(0, x0) / TilemapComponent.BLOCK_SIZE)
        this.bounds.y0 = Math.floor(Math.max(0, y0) / TilemapComponent.BLOCK_SIZE)
        this.bounds.x1 = Math.ceil(Math.min(maxWidth, x1) / TilemapComponent.BLOCK_SIZE)
        this.bounds.y1 = Math.ceil(Math.min(maxHeight, y1) / TilemapComponent.BLOCK_SIZE)
    }

    private drawMap(phase: DrawPhase) {
        let program = phase.getProgram(TextureProgram)
        let map = this.entity.getComponent(TilemapComponent)
        if (!map) return

        program.transform.save()
        program.transform.multiply(this.entity.getComponent(TransformComponent).getGlobalTransform())

        this.updateBounds(map, program.camera)

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
        let map = this.entity.getComponent(TilemapComponent)
        if (!map) return

        program.transform.save()
        program.transform.multiply(this.entity.getComponent(TransformComponent).getGlobalTransform())

        this.updateBounds(map, program.camera)

        const gridColor = 0xffe6e6e6

        let gridThickness = 0.2 / TilemapComponent.BLOCK_SIZE
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
        let borderThickness = 0.3 / TilemapComponent.BLOCK_SIZE
        let halfBorderThickness = borderThickness / 2

        this.drawLine(program, -halfBorderThickness, 0, borderThickness, this.bounds.y1, borderColor)
        this.drawLine(program, 0, -halfBorderThickness, this.bounds.x1, borderThickness, borderColor)
        this.drawLine(program, map.width - halfBorderThickness, 0, borderThickness, this.bounds.y1, borderColor)
        this.drawLine(program, 0, map.height - halfBorderThickness, this.bounds.x1, borderThickness, borderColor)

        program.transform.restore()
    }

    private drawLine(program: ConvexShapeProgram, x0: number, y0: number, width: number, height: number, color: number) {
        x0 *= TilemapComponent.BLOCK_SIZE
        y0 *= TilemapComponent.BLOCK_SIZE
        width *= TilemapComponent.BLOCK_SIZE
        height *= TilemapComponent.BLOCK_SIZE

        program.drawRectangle(x0, y0, x0 + width, y0 + height, color)
    }

    static registerBlockLoader(id: number, drawer: Constructor<BlockDrawer>) {
        this.RegisteredDrawers.set(id, drawer)
    }

    static RegisteredDrawers = new Map()
}