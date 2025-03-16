import Tool from '../tool';
import Rectangle from '../../../../utils/rectangle';
import MapAreaModification from '../../history/modification/map-area-modification';
import ToolManager from "../toolmanager";
import BlockState from "src/map/block-state/block-state";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import KeyboardListener from "src/client/controls/input/keyboard/keyboard-listener";
import GameMapHistoryComponent from "src/client/map-editor/history/game-map-history-component";
import {createOverlappingModel} from "src/utils/wfc/overlapping-model";
import {createSuperposition} from "src/utils/wfc/superposition";
import {createObservation} from "src/utils/wfc/observe";
import {propagate} from "src/utils/wfc/propagate";
import EntityDrawer from "src/client/graphics/drawers/entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import Entity from "src/utils/ecs/entity";
import React from 'react';
import { ToolViewProps } from '../../../ui/tool-settings/tool-settings-view';
import TilemapComponent from 'src/map/tilemap-component';

export class AreaToolDrawer extends EntityDrawer {
    private tool: AreaTool;

    constructor(tool: AreaTool) {
        super();

        this.tool = tool
    }

    draw(phase: DrawPhase) {
        const program = phase.getProgram(ConvexShapeProgram)

        if(this.tool.area.isValid()) {

            program.drawRectangle(
                this.tool.area.minX,
                this.tool.area.minY,
                this.tool.area.maxX,
                this.tool.area.maxY,
                0x7F7F7F7F
            )
        }
    }
}

const AreaToolView: React.FC<ToolViewProps<AreaTool>> = (props) => {
    return (
        <div className="tool-preferences">
            <button onClick={() => props.tool.fillWFC()}>
                Автогенерация на базе буфера обмена
            </button>
        </div>
    )   
}

interface CopyBuffer {
    width: number
    height: number
    blocks: BlockState[]
}

export default class AreaTool extends Tool {
	public area: Rectangle;
	public program: ConvexShapeProgram;
	public copyBuffer?: CopyBuffer;
	public keyboard: KeyboardListener;
	public initialAreaState: boolean;
	public movingArea: boolean;
	public pasting: boolean;
	public hover: boolean;
	public oldX: number | null = null;
	public oldY: number | null = null;

    public visibleEntity = new Entity()

    constructor(manager: ToolManager) {
        super(manager);

        this.visibleEntity.addComponent(new AreaToolDrawer(this))

        this.area = new Rectangle()
        this.image = "static/map-editor/area.png"

        this.copyBuffer = null

        this.controlsEventHandler.on("editor-copy", () => this.copy(false))
        this.controlsEventHandler.on("editor-paste", () => this.paste())
        this.controlsEventHandler.on("editor-cut", () => this.copy(true))
        this.controlsEventHandler.on("editor-reset-selection", () => this.resetSelection())
        this.controlsEventHandler.on("editor-delete", () => this.deleteArea())
        this.controlsEventHandler.on("editor-select-all", () => this.selectAll())

        this.initialAreaState = false
        this.movingArea = false
        this.pasting = false
        this.hover = false
        this.oldX = 0
        this.oldY = 0

        this.settingsView = AreaToolView
    }

    public fillWFC() {
        if(!this.copyBuffer) {
            this.manager.createEvent("Буфер обмена пуст")
            return
        }

        const image = {
            width: this.copyBuffer.width,
            height: this.copyBuffer.height,
            data: new Uint8ClampedArray(this.copyBuffer.blocks.map(block => (block.constructor as typeof BlockState).typeId))
        } as ImageData
        const model = createOverlappingModel(image, { periodicInput: false });
        const superpos = createSuperposition(
            model.numCoefficients,
            { width: this.area.width(), height: this.area.height(), periodic: false },
        );

        const observe = createObservation(model, superpos);

        const tilemap = this.getTilemap()
        let modification = new MapAreaModification(tilemap.entity, this.area.clone(), [])
        let newData = modification.fetchData()
        modification.newData = newData
        const history = tilemap.entity.getComponent(GameMapHistoryComponent)

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
                modification.fetchData()
                modification.newData = newData
                modification.perform()
                return
            } else {
                return
            }
        }

        step()
    }

    selectAll() {
        const tilemap = this.getTilemap()
        this.area.setFrom(0, 0)
        this.area.setTo(tilemap.width, tilemap.height)
        this.manager.setNeedsRedraw()
    }

    deleteArea() {
        if(!this.area.isValid()) return

        this.manager.createEvent(this.area.width() * this.area.height() + " блок(-ов) удалено")

        // const map = this.getTilemap()
        // const history = map.getComponent(GameMapHistoryComponent)

        // let areaModification = new MapAreaModification(map, this.area.clone(), void 0)
        // areaModification.perform()
        // history.registerModification(areaModification)
        // history.commitActions("Удаление")
        this.resetSelection()
        this.manager.setNeedsRedraw()
    }

    copy(cut: boolean) {
        if(!this.area.isValid()) return

        const tilemap = this.getTilemap()

        let bound = this.area.bounding(0, 0, tilemap.width, tilemap.height)

        if(bound.minX >= bound.maxX || bound.minY >= bound.maxY) return

        let width = bound.width()
        let height = bound.height()

        this.copyBuffer = {
            width: width,
            height: height,
            blocks: new Array(width * height)
        }

        let sourceIndex = bound.minX + bound.minY * tilemap.width
        let destinationIndex = 0

        for(let y = bound.minY; y < bound.maxY; y++) {
            for(let x = bound.minX; x < bound.maxX; x++) {
                this.copyBuffer.blocks[destinationIndex++] = tilemap.blocks[sourceIndex++]
            }

            sourceIndex += tilemap.width - width;
        }

        if(cut) {
            this.manager.createEvent(width * height + " блок(-ов) вырезано")
            const history = tilemap.entity.getComponent(GameMapHistoryComponent)

            let bound = this.area.bounding(0, 0, tilemap.width, tilemap.height)

            let areaModification = new MapAreaModification(tilemap.entity, bound, void 0)
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

        let cameraX = 0
        let cameraY = 0

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

        const tilemap = this.getTilemap()
        const history = tilemap.entity.getComponent(GameMapHistoryComponent)

        let modification = new MapAreaModification(tilemap.entity, this.area.clone(), this.copyBuffer.blocks.map((a: BlockState) => a.clone()))

        modification.perform()
        history.registerModification(modification)
        history.commitActions("Вставка")

        this.manager.setNeedsRedraw()
    }

    clampX(x: number) {
        const tilemap = this.getTilemap()
        return Math.max(0, Math.min(tilemap.width - 1, x))
    }

    clampY(y: number) {
        const tilemap = this.getTilemap()
        return Math.max(0, Math.min(tilemap.height - 1, y))
    }

    onMouseDown(x: number, y: number) {
        super.onMouseDown(x, y);

        x = Math.floor(x / 1)
        y = Math.floor(y / 1)

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

    onMouseUp(x: number, y: number) {
        super.onMouseUp(x, y);

        if(this.area.width() === 0 && this.area.height() === 0) {
            if(this.pasting) {
                this.commitPaste()
            }

            this.resetSelection()
        }

        this.initialAreaState = false
        this.movingArea = false
    }

    onMouseMove(x: number, y: number) {
        super.onMouseMove(x, y);

        x = Math.floor(x / 1)
        y = Math.floor(y / 1)

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

    becomeActive() {
        super.becomeActive();

        this.manager.setNeedsRedraw()
        // this.manager.world.appendChild(this.visibleEntity)
    }

    resignActive() {
        super.resignActive();

        this.manager.setNeedsRedraw()
        this.visibleEntity.removeFromParent()
    }

    getTilemap() {
        return this.getOnlySelectedEntity()?.getComponent(TilemapComponent)
    }

    isSuitable(): boolean {
        return !!this.getTilemap()
    }
}