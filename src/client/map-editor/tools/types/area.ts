import Tool from '../tool';
import Rectangle from '../../../../utils/rectangle';
import MapDrawer from '../../../graphics/drawers/map-drawer';
import MapAreaModification from '../../history/modification/map-area-modification';
import ToolManager from "../toolmanager";
import BlockState from "src/map/block-state/block-state";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import TilemapComponent from "src/physics/tilemap-component";
import KeyboardListener from "src/client/controls/input/keyboard/keyboard-listener";
import GameMap from "src/map/game-map";
import GameMapHistoryComponent from "src/client/map-editor/history/game-map-history-component";
import {createOverlappingModel} from "src/utils/wfc/overlapping-model";
import {createSuperposition} from "src/utils/wfc/superposition";
import {createObservation} from "src/utils/wfc/observe";
import {propagate} from "src/utils/wfc/propagate";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import ControlsManager from "src/client/controls/controls-manager";

export default class AreaTool extends Tool {
	public area: Rectangle;
	public program: ConvexShapeProgram;
	public copyBufferDrawer: MapDrawer;
	public copyBuffer: GameMap;
	public keyboard: KeyboardListener;
	public initialAreaState: boolean;
	public movingArea: boolean;
	public pasting: boolean;
	public hover: boolean;
	public oldX: number;
	public oldY: number;

    public controlsEventHandler = new BasicEventHandlerSet()

    constructor(manager: ToolManager) {
        super(manager);

        this.area = new Rectangle()
        this.image = "assets/img/area.png"
        this.program = new ConvexShapeProgram(this.manager.screen.ctx)
        this.copyBufferDrawer = new MapDrawer(this.manager.screen)

        this.copyBuffer = null

        this.controlsEventHandler.on("editor-copy", () => this.copy(false))
        this.controlsEventHandler.on("editor-paste", () => this.paste())
        this.controlsEventHandler.on("editor-cut", () => this.copy(true))
        this.controlsEventHandler.on("editor-reset-selection", () => this.resetSelection())
        this.controlsEventHandler.on("editor-clear-area", () => this.deleteArea())
        this.controlsEventHandler.on("editor-select-all", () => this.selectAll())

        this.initialAreaState = false
        this.movingArea = false
        this.pasting = false
        this.hover = false
        this.oldX = 0
        this.oldY = 0

        this.setupMenu()
    }

    setupMenu() {
        let label = $("<div>")
            .addClass("text")
            .text("Автогенерация на базе буфера обмена")
            .on("click", () => {
                this.fillWFC()
            })
        let labelContainer = $("<div>").addClass("container")
            .css("width", "300px")
            .append(label)

        this.settingsView = $("<div>")
            .append(labelContainer)
            .css("width", "300px")
            .css("height", "100%")

    }

    private fillWFC() {
        if(!this.copyBuffer) {
            this.manager.createEvent("Буфер обмена пуст")
            return
        }

        const image = {
            width: this.copyBuffer.width,
            height: this.copyBuffer.height,
            data: new Uint8ClampedArray(this.copyBuffer.data.map(block => (block.constructor as typeof BlockState).typeId))
        }
        const model = createOverlappingModel(image, { periodicInput: false });
        const superpos = createSuperposition(
            model.numCoefficients,
            { width: this.area.width(), height: this.area.height(), periodic: false },
        );

        const observe = createObservation(model, superpos);

        const map = this.manager.world.getComponent(TilemapComponent).map as GameMap
        let modification = new MapAreaModification(map, this.area.clone(), [])
        let newData = modification.fetchData()
        modification.newData = newData
        const history = map.getComponent(GameMapHistoryComponent)

        history.registerModification(modification)
        history.commitActions("Автозаполнение")

        const step = () => {
            let result = observe()
            if(result === null) {
                while(true) {
                    const waveIndex = propagate(model, superpos)
                    if(waveIndex === null) {
                        break
                    }
                    const w = superpos.wave[waveIndex];

                    const patternCount = model.patternCount

                    let activeCoefficients = 0;
                    let sum = 0;
                    let lastPatternIndex = 0;

                    for (let i = 0; i < w.length; i++) {
                        if (w[i]) {
                            activeCoefficients++;
                            sum += patternCount[i];
                            lastPatternIndex = i;
                        }
                    }

                    const x = waveIndex % superpos.width;
                    const y = Math.floor(waveIndex / superpos.width);

                    if (activeCoefficients === 1) {
                        const pattern = model.patterns[lastPatternIndex];
                        if (!superpos.periodic && (x >= superpos.width - model.N || y >= superpos.height - model.N)) {
                            for (let i = 0; i < model.N; i++) {
                                for (let j = 0; j < model.N; j++) {
                                    let id = model.colors[pattern[i + j * model.N]]
                                    let clazz = BlockState.getBlockStateClass(id)
                                    newData[x + i + (y + j) * superpos.width] = new clazz()
                                    modification.perform()
                                }
                            }
                        } else {
                            let id = model.colors[pattern[0]]
                            let clazz = BlockState.getBlockStateClass(id)
                            newData[x + y * superpos.width] = new clazz()
                            modification.perform()
                        }
                    }
                }

                requestAnimationFrame(() => step())

            } else if(result === false) {
                this.manager.createEvent("Не удалось заполнить область")
                return
            } else {
                return
            }
        }

        step()
    }

    selectAll() {
        const map = this.manager.world.getComponent(TilemapComponent).map

        this.area.setFrom(0, 0)
        this.area.setTo(map.width, map.height)

        this.manager.setNeedsRedraw()
    }

    deleteArea() {
        if(!this.area.isValid()) return

        this.manager.createEvent(this.area.width() * this.area.height() + " блок(-ов) удалено")

        const map = this.manager.world.getComponent(TilemapComponent).map
        const history = map.getComponent(GameMapHistoryComponent)

        let areaModification = new MapAreaModification(map, this.area.clone(), void 0)
        areaModification.perform()
        history.registerModification(areaModification)
        history.commitActions("Удаление")
        this.resetSelection()
        this.manager.setNeedsRedraw()
    }

    copy(cut: boolean) {
        if(!this.area.isValid()) return

        const map = this.manager.world.getComponent(TilemapComponent).map as GameMap

        let bound = this.area.bounding(0, 0, map.width, map.height)

        if(bound.minX >= bound.maxX || bound.minY >= bound.maxY) return

        let width = bound.width()
        let height = bound.height()

        this.copyBuffer = new GameMap({
            width: width,
            height: height,
            data: new Array(width * height)
        })

        let sourceIndex = bound.minX + bound.minY * map.width
        let destinationIndex = 0

        for(let y = bound.minY; y < bound.maxY; y++) {
            for(let x = bound.minX; x < bound.maxX; x++) {
                this.copyBuffer.data[destinationIndex++] = map.data[sourceIndex++]
            }

            sourceIndex += map.width - width;
        }

        if(cut) {
            this.manager.createEvent(width * height + " блок(-ов) вырезано")
            const history = map.getComponent(GameMapHistoryComponent)

            let bound = this.area.bounding(0, 0, map.width, map.height)

            let areaModification = new MapAreaModification(map, bound, void 0)
            areaModification.perform()
            history.registerModification(areaModification)
            history.commitActions("Вырезание")

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
        let cameraX = Math.floor(position.x / GameMap.BLOCK_SIZE)
        let cameraY = Math.floor(position.y / GameMap.BLOCK_SIZE)

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

        const map = this.manager.world.getComponent(TilemapComponent).map as GameMap
        const history = map.getComponent(GameMapHistoryComponent)

        let modification = new MapAreaModification(map, this.area.clone(), this.copyBuffer.data.map((a: BlockState) => a.clone()))

        modification.perform()
        history.registerModification(modification)
        history.commitActions("Вставка")

        this.manager.setNeedsRedraw()
    }

    clampX(x: number) {
        return Math.max(0, Math.min(this.manager.world.getComponent(TilemapComponent).map.width - 1, x))
    }

    clampY(y: number) {
        return Math.max(0, Math.min(this.manager.world.getComponent(TilemapComponent).map.height - 1, y))
    }

    mouseDown(x: number, y: number) {
        super.mouseDown(x, y);

        x = Math.floor(x / GameMap.BLOCK_SIZE)
        y = Math.floor(y / GameMap.BLOCK_SIZE)

        if(this.area.isValid()) {
            if(this.area.contains(x, y)) {
                this.movingArea = true
                return
            }
        }

        x = this.clampX(x)
        y = this.clampY(y)

        this.oldX = x
        this.oldY = y

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

        x = Math.floor(x / GameMap.BLOCK_SIZE)
        y = Math.floor(y / GameMap.BLOCK_SIZE)

        x = this.clampX(x)
        y = this.clampY(y)

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
                this.area.minX * GameMap.BLOCK_SIZE,
                this.area.minY * GameMap.BLOCK_SIZE,
                this.area.maxX * GameMap.BLOCK_SIZE,
                this.area.maxY * GameMap.BLOCK_SIZE,
                0x7F7F7F7F
            )
        }

        this.program.bind()
        this.program.setCamera(this.manager.camera)
        this.program.draw()

        if(this.pasting) {
            this.manager.camera.matrix.save()

            let x = this.area.minX * GameMap.BLOCK_SIZE
            let y = this.area.minY * GameMap.BLOCK_SIZE

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
        this.controlsEventHandler.setTarget(ControlsManager.getInstance())
    }

    resignActive() {
        super.resignActive();

        this.manager.setNeedsRedraw()
        this.controlsEventHandler.setTarget(null)
    }
}