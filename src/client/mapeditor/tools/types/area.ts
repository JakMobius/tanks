
import Tool from '../tool';
import Rectangle from '../../../../utils/rectangle';
import ParticleProgram from '../../../graphics/programs/particleprogram';
import Particle from '../../../particles/particle';
import Color from '../../../../utils/color';
import KeyboardController from '../../../controls/interact/keyboardcontroller';
import MapDrawer from '../../../graphics/drawers/mapdrawer';
import EditorMap from '../../editormap';
import MapAreaModification from '../../history/modification/mapareamodification';
import ToolManager from "../toolmanager";
import BlockState from "../../../../utils/map/blockstate/blockstate";

class AreaTool extends Tool {
	public area: any;
	public program: any;
	public copyBufferDrawer: any;
	public decoration: Particle;
	public copyBuffer: EditorMap;
	public keyboard: any;
	public initialAreaState: any;
	public movingArea: any;
	public pasting: any;
	public hover: any;
	public oldX: number;
	public oldY: number;

    constructor(manager: ToolManager) {
        super(manager);

        this.area = new Rectangle()
        this.image = "../assets/mapeditor/area.png"
        this.program = new ParticleProgram("area-program", this.manager.screen.ctx)
        this.copyBufferDrawer = new MapDrawer(this.manager.camera, this.manager.screen.ctx)

        this.decoration = new Particle({
            x: 0, y: 0,
            color: new Color(127, 127, 127, 0.5),
        })

        this.copyBuffer = null
        this.keyboard = new KeyboardController()

        this.keyboard.keybinding("Cmd-C", () => this.copy(false))
        this.keyboard.keybinding("Cmd-V", () => this.paste())
        this.keyboard.keybinding("Cmd-X", () => this.copy(true))
        this.keyboard.keybinding("Cmd-D", () => this.resetSelection())
        this.keyboard.keybinding("Backspace", () => this.deleteArea())

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

        let areaModification = new MapAreaModification(this.manager.map, this.area.clone(), void 0)
        areaModification.perform()
        this.manager.map.history.registerModification(areaModification)
        this.manager.map.history.commitActions("Удаление")
        this.resetSelection()
        this.manager.setNeedsRedraw(true)
    }

    copy(cut: boolean) {
        if(!this.area.isValid()) return

        let bound = this.area.bounding(0, 0, this.manager.map.width, this.manager.map.height)

        if(bound.minX >= bound.maxX || bound.minY >= bound.maxY) return

        let width = bound.width()
        let height = bound.height()

        this.copyBuffer = new EditorMap({
            width: width,
            height: height,
            data: new Array(width * height),
            name: "Буфер обмена"
        })

        let sourceIndex = bound.minX + bound.minY * this.manager.map.width
        let destinationIndex = 0

        for(let y = bound.minY; y < bound.maxY; y++) {
            for(let x = bound.minX; x < bound.maxX; x++) {
                this.copyBuffer.data[destinationIndex++] = this.manager.map.data[sourceIndex++]
            }

            sourceIndex -= (width - this.manager.map.height);
        }

        if(cut) {
            this.manager.createEvent(width * height + " блок(-ов) вырезано")

            let bound = this.area.bounding(0, 0, this.manager.map.width, this.manager.map.height)

            let areaModification = new MapAreaModification(this.manager.map, bound, void 0)
            areaModification.perform()
            this.manager.map.history.registerModification(areaModification)
            this.manager.map.history.commitActions("Вырезание")

            this.resetSelection()
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

        let modification = new MapAreaModification(this.manager.map, this.area.clone(), this.copyBuffer.data.map((a: BlockState) => a.clone()))

        modification.perform()
        this.manager.map.history.registerModification(modification)
        this.manager.map.history.commitActions("Вставка")

        this.manager.setNeedsRedraw(true)
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

        this.program.use()
        this.program.prepare()

        if(this.area.isValid()) {
            this.decoration.x = this.area.centerX() * EditorMap.BLOCK_SIZE
            this.decoration.y = this.area.centerY() * EditorMap.BLOCK_SIZE
            this.decoration.width = this.area.width() * EditorMap.BLOCK_SIZE
            this.decoration.height = this.area.height() * EditorMap.BLOCK_SIZE

            this.program.drawParticle(this.decoration)
        }

        this.program.matrixUniform.setMatrix(this.manager.camera.matrix.m)
        this.program.draw()

        if(this.pasting) {
            this.manager.camera.matrix.save()

            let x = this.area.minX * EditorMap.BLOCK_SIZE
            let y = this.area.minY * EditorMap.BLOCK_SIZE

            this.manager.camera.position.x -= x
            this.manager.camera.position.y -= y

            this.manager.camera.matrix.translate(x, y)
            this.copyBufferDrawer.draw(this.copyBuffer)
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

export default AreaTool;