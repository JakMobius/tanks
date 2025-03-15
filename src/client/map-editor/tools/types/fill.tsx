import TransformComponent from 'src/entity/components/transform/transform-component';
import Tool from '../tool';
import ToolManager from '../toolmanager';
import BlockState from "src/map/block-state/block-state";
import TilemapComponent from 'src/map/tilemap-component';
import WorldDrawerComponent from 'src/client/entity/components/world-drawer-component';
import DrawPhase from 'src/client/graphics/drawers/draw-phase';
import ConvexShapeProgram from 'src/client/graphics/programs/convex-shapes/convex-shape-program';
import Color from 'src/utils/color';
import { squareQuadrangleFromPoints } from 'src/utils/quadrangle';

export default class Fill extends Tool {
    blockX: number | null = null
    blockY: number | null = null

    public brushColor = new Color().setRGB(0, 1, 0, 0.5)

    cameraDrawCallback = (phase: DrawPhase) => this.drawPreview(phase)

    constructor(manager: ToolManager) {
        super(manager);

        this.image = "static/map-editor/fill.png"
        // this.actionName = "Заливка"
        this.setCursor("url(static/map-editor/fill.png) 18 18, auto")
    }

    handleMouse(x: number, y: number) {
        let transformComponent = this.manager.selectedServerEntity.getComponent(TransformComponent)
        let transformMatrix = transformComponent.getInvertedGlobalTransform()

        let blockX = Math.floor(transformMatrix.transformX(x, y))
        let blockY = Math.floor(transformMatrix.transformY(x, y))

        if(blockX !== this.blockX || blockY !== this.blockY) {
            this.blockX = blockX
            this.blockY = blockY
            this.manager.setNeedsRedraw()
        }
    }

    onMouseMove(x: number, y: number): void {
        super.onMouseMove(x, y)
        this.handleMouse(x, y)
    }

    onMouseDown(x: number, y: number) {
        super.onMouseDown(x, y);

        this.handleMouse(x, y)
        this.fill()
    }

    becomeActive() {
        super.becomeActive()
        this.blockX = null
        this.blockY = null
        let drawer = this.manager.clientCameraEntity.getComponent(WorldDrawerComponent)
        drawer.entityDrawPhase.on("draw", this.cameraDrawCallback)
        this.manager.setNeedsRedraw()
    }

    resignActive() {
        super.resignActive();
        this.blockX = null
        this.blockY = null
        let drawer = this.manager.clientCameraEntity.getComponent(WorldDrawerComponent)
        drawer.entityDrawPhase.off("draw", this.cameraDrawCallback)
        this.manager.setNeedsRedraw()
    }

    getBitset(bitset: Uint8Array, index: number) {
        return bitset[Math.floor(index >> 3)] & (1 << (index & 0b111))
    }

    setBitset(bitset: Uint8Array, index: number, value: boolean) {
        let byte = Math.floor(index >> 3)
        let bit = index & 0b111
        bitset[byte] &= (~(1 << bit))
        if(value) {
            bitset[byte] |= (1 << bit)
        }
    }

    fill() {
        const tilemap = this.getTilemap()
        let baseBlock = tilemap.getBlock(this.blockX, this.blockY)

        if(!baseBlock) return

        let baseId = (baseBlock.constructor as typeof BlockState).typeId
        let copy = new Uint8Array(Math.ceil(tilemap.blocks.length / 8))
        let carets = [this.blockX + this.blockY * tilemap.width]

        while(carets.length) {
            let newCarets = []

            for(let caret of carets) {

                if(this.getBitset(copy, caret)) {
                    continue
                }

                let x = caret % tilemap.width
                let y = Math.floor(caret / tilemap.width)

                let block = tilemap.getBlock(x, y)

                if((block.constructor as typeof BlockState).typeId !== baseId) {
                    continue
                }

                tilemap.setBlock(x, y, this.manager.selectedBlock.clone())

                this.setBitset(copy, caret, true)

                if(x > 0) newCarets.push(caret - 1)
                if(x < tilemap.width - 1) newCarets.push(caret + 1)
                if(y > 0) newCarets.push(caret - tilemap.width)
                if(y < tilemap.height - 1)newCarets.push(caret + tilemap.width)
            }

            carets = newCarets
        }

        this.manager.setNeedsRedraw()

        // const history = tilemap.entity.getComponent(GameMapHistoryComponent)
        // history.commitActions(this.actionName)
    }

    drawPreview(phase: DrawPhase) {
        if (this.blockX === null || this.blockX === null) {
            return
        }

        const program = phase.getProgram(ConvexShapeProgram)

        let transform = this.manager.selectedServerEntity.getComponent(TransformComponent)
        program.transform.save()
        program.transform.set(transform.getGlobalTransform())

        let quadrangle = squareQuadrangleFromPoints(this.blockX, this.blockY, this.blockX + 1, this.blockY + 1)
        program.drawQuadrangle(quadrangle, this.brushColor.getUint32())

        program.transform.restore()
    }

    getTilemap() {
        return this.manager.selectedServerEntity?.getComponent(TilemapComponent)
    }
    
    isSuitable(): boolean {
        return !!this.getTilemap()
    }
}