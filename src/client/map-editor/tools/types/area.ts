import Tool from '../tool';
import Rectangle from '../../../../utils/rectangle';
import KeyboardController from '../../../controls/input/keyboard/keyboard-controller';
import MapDrawer from '../../../graphics/drawers/map-drawer';
import EditorMap from '../../editor-map';
import MapAreaModification from '../../history/modification/map-area-modification';
import ToolManager from "../toolmanager";
import BlockState from "../../../../map/block-state/block-state";
import ConvexShapeProgram from "../../../graphics/programs/convex-shapes/convex-shape-program";
import TilemapComponent from "../../../../physics/tilemap-component";
import KeyboardListener from "../../../controls/input/keyboard/keyboard-listener";

export default class AreaTool extends Tool {
	public area: Rectangle;
	public program: ConvexShapeProgram;
	public copyBufferDrawer: MapDrawer;
	public copyBuffer: EditorMap;
	public keyboard: KeyboardListener;
	public initialAreaState: boolean;
	public movingArea: boolean;
	public pasting: boolean;
	public hover: boolean;
	public oldX: number;
	public oldY: number;

    constructor(manager: ToolManager) {
        super(manager);

        this.area = new Rectangle()
        this.image = "assets/img/area.png"
        this.program = new ConvexShapeProgram(this.manager.screen.ctx)
        this.copyBufferDrawer = new MapDrawer(this.manager.screen)

        this.copyBuffer = null
        this.keyboard = new KeyboardListener()

        this.keyboard.onKeybinding("Cmd-C", () => this.copy(false))
        this.keyboard.onKeybinding("Cmd-V", () => this.paste())
        this.keyboard.onKeybinding("Cmd-X", () => this.copy(true))
        this.keyboard.onKeybinding("Cmd-D", () => this.resetSelection())
        this.keyboard.onKeybinding("Backspace", () => this.deleteArea())

        this.initialAreaState = false
        this.movingArea = false
        this.pasting = false
        this.hover = false
        this.oldX = 0
        this.oldY = 0
    }

    deleteArea() {
        if(!this.area.isValid()) return

        this.manager.createEvent(this.area.width() * this.area.height() + " блок(-ов) удалено")

        const map = this.manager.world.getComponent(TilemapComponent).map as EditorMap
        let areaModification = new MapAreaModification(map, this.area.clone(), void 0)
        areaModification.perform()
        map.history.registerModification(areaModification)
        map.history.commitActions("Удаление")
        this.resetSelection()
        this.manager.setNeedsRedraw()
    }

    copy(cut: boolean) {
        if(!this.area.isValid()) return

        const map = this.manager.world.getComponent(TilemapComponent).map as EditorMap

        let bound = this.area.bounding(0, 0, map.width, map.height)

        if(bound.minX >= bound.maxX || bound.minY >= bound.maxY) return

        let width = bound.width()
        let height = bound.height()

        this.copyBuffer = new EditorMap({
            width: width,
            height: height,
            data: new Array(width * height),
            name: "Буфер обмена"
        })

        let sourceIndex = bound.minX + bound.minY * map.width
        let destinationIndex = 0

        for(let y = bound.minY; y < bound.maxY; y++) {
            for(let x = bound.minX; x < bound.maxX; x++) {
                this.copyBuffer.data[destinationIndex++] = map.data[sourceIndex++]
            }

            sourceIndex -= (width - map.height);
        }

        if(cut) {
            this.manager.createEvent(width * height + " блок(-ов) вырезано")

            let bound = this.area.bounding(0, 0, map.width, map.height)

            let areaModification = new MapAreaModification(map, bound, void 0)
            areaModification.perform()
            map.history.registerModification(areaModification)
            map.history.commitActions("Вырезание")

            this.resetSelection()

            this.manager.setNeedsRedraw()
        } else {
            this.manager.createEvent(width * height + " блок(-ов) скопировано")
        }
    }

    paste() {
        if(this.pasting) {
            this.commitPaste()
        }

        if(!this.copyBuffer) {
            this.manager.createEvent("Нечего вставлять")
            return
        }
        this.pasting = true
        let width = this.copyBuffer.width
        let height = this.copyBuffer.height
        let position = this.manager.camera.position
        let cameraX = Math.floor(position.x / EditorMap.BLOCK_SIZE)
        let cameraY = Math.floor(position.y / EditorMap.BLOCK_SIZE)

        this.area.setFrom(Math.floor(cameraX - width / 2), Math.floor(cameraY - height / 2))
        this.area.setTo(Math.floor(cameraX + width / 2), Math.floor(cameraY + height / 2))

        this.manager.createEvent(width * height + " блок(-ов) вставлено")

        this.manager.setNeedsRedraw()
    }

    resetSelection() {
        this.area.invalidate()
        this.manager.setNeedsRedraw()
    }

    commitPaste() {
        this.pasting = false

        const map = this.manager.world.getComponent(TilemapComponent).map as EditorMap

        let modification = new MapAreaModification(map, this.area.clone(), this.copyBuffer.data.map((a: BlockState) => a.clone()))

        modification.perform()
        map.history.registerModification(modification)
        map.history.commitActions("Вставка")

        this.manager.setNeedsRedraw()
    }

    mouseDown(x: number, y: number) {
        super.mouseDown(x, y);

        x = Math.floor(x / EditorMap.BLOCK_SIZE)
        y = Math.floor(y / EditorMap.BLOCK_SIZE)

        this.oldX = x
        this.oldY = y

        if(this.area.isValid()) {
            if(this.area.contains(x, y)) {
                this.movingArea = true
                return
            }
        }

        if(this.pasting) {
            this.commitPaste()
            this.resetSelection()
            return
        }

        this.area.setFrom(x, y)
        this.area.setTo(x, y)
        this.initialAreaState = true
    }

    mouseUp() {
        super.mouseUp();

        if(this.area.width() === 0 && this.area.height() === 0) {
            if(this.pasting) {
                this.commitPaste()
            }

            this.resetSelection()
        }

        this.initialAreaState = false
        this.movingArea = false
    }

    mouseMove(x: number, y: number) {
        super.mouseMove(x, y);

        x = Math.floor(x / EditorMap.BLOCK_SIZE)
        y = Math.floor(y / EditorMap.BLOCK_SIZE)

        if(this.dragging) {
            if(this.initialAreaState) {
                if(x >= this.area.x1) x++
                if(y >= this.area.y1) y++

                this.area.setTo(x, y)
                this.manager.setNeedsRedraw()
            } else if(this.movingArea) {
                this.area.translate(x - this.oldX, y - this.oldY)
                this.manager.setNeedsRedraw()
            }
        }

        let hover = this.area.isValid() && this.area.contains(x, y)
        if(hover !== this.hover) {
            this.hover = hover
            if (hover) {
                this.setCursor("move")
            } else {
                this.setCursor("default")
            }
        }

        this.oldX = x
        this.oldY = y
    }

    drawDecorations() {
        super.drawDecorations();

        this.program.reset()

        if(this.area.isValid()) {

            this.program.drawRectangle(
                this.area.minX * EditorMap.BLOCK_SIZE,
                this.area.minY * EditorMap.BLOCK_SIZE,
                this.area.maxX * EditorMap.BLOCK_SIZE,
                this.area.maxY * EditorMap.BLOCK_SIZE,
                0x7F7F7F7F
            )
        }

        this.program.bind()
        this.program.setCamera(this.manager.camera)
        this.program.draw()

        if(this.pasting) {
            this.manager.camera.matrix.save()

            let x = this.area.minX * EditorMap.BLOCK_SIZE
            let y = this.area.minY * EditorMap.BLOCK_SIZE

            this.manager.camera.position.x -= x
            this.manager.camera.position.y -= y

            this.manager.camera.matrix.translate(x, y)
            this.copyBufferDrawer.drawMap(this.copyBuffer, this.manager.camera)
            this.manager.camera.matrix.restore()

            this.manager.camera.position.x += x
            this.manager.camera.position.y += y
        }
    }

    becomeActive() {
        super.becomeActive();

        this.manager.setNeedsRedraw()
        this.keyboard.startListening()
    }

    resignActive() {
        super.resignActive();

        this.manager.setNeedsRedraw()
        this.keyboard.stopListening()
    }
}