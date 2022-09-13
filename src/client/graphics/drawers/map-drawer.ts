import {Constructor} from "src/serialization/binary/serializable";
import BlockDrawer from "./block/block-drawer";
import Sprite from "src/client/sprite";
import GameMap from "src/map/game-map";
import BlockState from "src/map/block-state/block-state";
import Camera from "src/client/camera";
import TextureProgram from "../programs/texture-program";
import Screen from "../screen";
import ConvexShapeProgram from "../programs/convex-shapes/convex-shape-program";

export interface DrawerBounds {
    x0: number
    x1: number
    y0: number
    y1: number
}

export default class MapDrawer {
    public oldBounds: DrawerBounds
    public blockProgram: TextureProgram
    public gridDrawingProgram: ConvexShapeProgram
    public screen: Screen

    constructor(screen: Screen) {
        this.screen = screen
        this.blockProgram = new TextureProgram(this.screen.ctx, {
            largeIndices: true
        })

        this.gridDrawingProgram = new ConvexShapeProgram(this.screen.ctx)

        this.reset()
    }

    drawMap(map: GameMap, camera: Camera) {
        const scale = camera.scale;

        let mipmaplevel =  Math.ceil(1 / scale) - 1
        let oldmipmaplevel = Sprite.mipmaplevel
        if(mipmaplevel >= Sprite.mipmapimages.length) {
            mipmaplevel = Sprite.mipmapimages.length - 1
        }
        if(mipmaplevel !== oldmipmaplevel) {
            Sprite.setMipMapLevel(mipmaplevel)
        }

        const visibleWidth = camera.viewport.x / scale;
        const visibleHeight = camera.viewport.y / scale;

        const cx = camera.position.x + camera.shaking.x
        const cy = camera.position.y + camera.shaking.y

        let x0 = cx - visibleWidth / 2, y0 = cy - visibleHeight / 2;
        let x1 = x0 + visibleWidth, y1 = y0 + visibleHeight;

        const maxWidth = map.width * GameMap.BLOCK_SIZE;
        const maxHeight = map.height * GameMap.BLOCK_SIZE;

        x0 = Math.floor(Math.max(0, x0) / GameMap.BLOCK_SIZE)
        y0 = Math.floor(Math.max(0, y0) / GameMap.BLOCK_SIZE)
        x1 = Math.ceil(Math.min(maxWidth, x1) / GameMap.BLOCK_SIZE)
        y1 = Math.ceil(Math.min(maxHeight, y1) / GameMap.BLOCK_SIZE)

        if(x0 !== this.oldBounds.x0 || x1 !== this.oldBounds.x1 ||
            y0 !== this.oldBounds.y0 || y1 !== this.oldBounds.y1 || mipmaplevel !== oldmipmaplevel) {

            this.oldBounds.x0 = x0
            this.oldBounds.x1 = x1
            this.oldBounds.y0 = y0
            this.oldBounds.y1 = y1

            this.blockProgram.reset()

            for(let x = x0; x <= x1; x ++) {
                for(let y = y0; y <= y1; y++) {
                    const block = map.getBlock(x, y);

                    if(block) this.drawBlock(block, x, y, map)
                }
            }

            this.gridDrawingProgram.reset()
            this.drawGrid(map)
        }

        this.gridDrawingProgram.bind()
        this.gridDrawingProgram.setCamera(camera)
        this.gridDrawingProgram.draw()

        this.blockProgram.bind()
        this.blockProgram.setCamera(camera)
        Sprite.setGLMipMapLevel(this.screen.ctx, this.blockProgram.textureUniform, mipmaplevel)
        this.blockProgram.draw()

        if(mipmaplevel !== oldmipmaplevel) {
            Sprite.setMipMapLevel(oldmipmaplevel)
        }
    }

    drawLine(x0: number, y0: number, width: number, height: number, color: number) {
        x0 *= GameMap.BLOCK_SIZE
        y0 *= GameMap.BLOCK_SIZE
        width *= GameMap.BLOCK_SIZE
        height *= GameMap.BLOCK_SIZE

        this.gridDrawingProgram.drawRectangle(x0, y0, x0 + width, y0 + height, color)
    }

    drawGrid(map: GameMap) {
        const gridColor = 0xffe6e6e6

        let gridThickness = 0.2 / GameMap.BLOCK_SIZE
        let halfGridThickness = gridThickness / 2

        for(let x = this.oldBounds.x0; x <= this.oldBounds.x1; x ++) {
            if (x != 0 && x != map.width) {
                this.drawLine(x - halfGridThickness, 0, gridThickness, this.oldBounds.y1, gridColor)
            }
        }

        for(let y = this.oldBounds.y0; y <= this.oldBounds.y1; y ++) {
            if (y != 0 && y != map.height) {
                this.drawLine(0, y - halfGridThickness, this.oldBounds.x1, gridThickness, gridColor)
            }
        }

        const borderColor = 0xffd4d4d4
        let borderThickness = 0.3 / GameMap.BLOCK_SIZE
        let halfBorderThickness = borderThickness / 2

        this.drawLine(-halfBorderThickness, 0, borderThickness, this.oldBounds.y1, borderColor)
        this.drawLine(0, -halfBorderThickness, this.oldBounds.x1, borderThickness, borderColor)
        this.drawLine(map.width - halfBorderThickness, 0, borderThickness, this.oldBounds.y1, borderColor)
        this.drawLine(0, map.height - halfBorderThickness, this.oldBounds.x1, borderThickness, borderColor)

    }

    private drawBlock(block: BlockState, x: number, y: number, map: GameMap) {
        let id = (block.constructor as typeof BlockState).typeId

        if(id === 0) return

        let drawer = MapDrawer.RegisteredDrawers.get(id)

        if(drawer) {
            drawer.draw(this.blockProgram, x, y, block, map)
        }
    }

    reset() {
        this.oldBounds = {
            x0: 0,
            x1: 0,
            y0: 0,
            y1: 0
        }
    }

    static registerBlockLoader(id: number, drawer: Constructor<BlockDrawer>) {
        this.RegisteredDrawers.set(id, drawer)
    }
    static RegisteredDrawers = new Map()
}