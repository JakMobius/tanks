import Tool from '../tool';
import RangeView from '../../../ui/elements/range/range';
import ToolManager from "../toolmanager";
import BlockState from "src/map/block-state/block-state";
import Color from "src/utils/color";
import {squareQuadrangleFromPoints} from "src/utils/quadrangle";
import TilemapComponent from "src/physics/tilemap-component";
import GameMap from "src/map/game-map";
import GameMapHistoryComponent from "src/client/map-editor/history/game-map-history-component";
import EntityDrawer from "src/client/graphics/drawers/entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import Entity from "src/utils/ecs/entity";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import {clamp} from "src/utils/utils";

export class PencilDrawer extends EntityDrawer {
    tool: Pencil

    constructor(tool: Pencil) {
        super()

        this.tool = tool
    }

    draw(phase: DrawPhase) {
        if(!this.tool.brushPositionKnown) {
            return
        }

        const program = phase.getProgram(ConvexShapeProgram)

        const map = this.tool.manager.world.getComponent(TilemapComponent).map

        const scale = GameMap.BLOCK_SIZE
        const x = this.tool.brushX
        const y = this.tool.brushY

        let dyStart = Math.max(0, -y)
        let dyEnd = Math.min(this.tool.thickness, map.height - y)

        for (let dy = dyStart; dy < dyEnd; dy++) {
            let bounds = this.tool.brushRowBoundsFor(dy)

            bounds[0] = clamp(bounds[0] + x, 0, map.width) * scale
            bounds[1] = clamp(bounds[1] + x, 0, map.width) * scale

            let quadrangle = squareQuadrangleFromPoints(bounds[0], (y + dy) * scale, bounds[1], (y + dy + 1) * scale)

            program.drawQuadrangle(quadrangle, this.tool.brushColor.getUint32())
        }
    }
}

export default class Pencil extends Tool {
    public actionName = "Карандаш";
    public image = "static/map-editor/pencil.png"

    public mouseX = 0
    public mouseY = 0

    // Coordinates of the top-left corner of the brush
    public brushX = 0;
    public brushY = 0;

    public brushPositionKnown = false;

    public isSquare = false;
    public thicknessRangeInput = new RangeView();
    public thicknessLabel: JQuery;
    public thicknessContainer: JQuery;
    public roundModeButton: JQuery;
    public squareModeButton: JQuery;
    public thickness: number;
    public oldX: number | null = null;
    public oldY: number | null = null;
    public brushColor = new Color().setRGB(0, 1, 0, 0.5)

    public maxSize = 32

    public visibleEntity = new Entity()

    constructor(manager: ToolManager) {
        super(manager);

        this.visibleEntity.addComponent(new PencilDrawer(this))

        this.setupMenu()
        this.setThickness(1)

        this.controlsEventHandler.on("editor-increase-brush-size", () => {
            this.setThickness(this.thickness + 1)
            this.thicknessRangeInput.setValue(this.thickness / this.maxSize)
        })

        this.controlsEventHandler.on("editor-decrease-brush-size", () => {
            this.setThickness(this.thickness - 1)
            this.thicknessRangeInput.setValue(this.thickness / this.maxSize)
        })
    }

    setupMenu() {
        this.thicknessRangeInput = new RangeView()
        this.thicknessRangeInput.element.css("height", "100%")
        this.thicknessLabel = $("<div>").addClass("text")
        this.thicknessContainer = $("<div>").addClass("container")
            .css("width", "25px")
            .append(this.thicknessLabel)

        this.roundModeButton = $("<div>")
            .addClass("tool inline selected")
            .css("background-image", "url(static/map-editor/round-brush.png)")
            .on("click", () => {
                this.roundModeButton.addClass("selected")
                this.squareModeButton.removeClass("selected")
                this.isSquare = false
            })

        this.squareModeButton = $("<div>")
            .addClass("tool inline")
            .css("background-image", "url(static/map-editor/square-brush.png)")
            .on("click", () => {
                this.roundModeButton.removeClass("selected")
                this.squareModeButton.addClass("selected")
                this.isSquare = true
            })

        this.thicknessRangeInput.on("value", (value: number) => {
            this.setThickness(Math.round(value * this.maxSize) + 1)
        })

        this.settingsView = $("<div>")
            .append(this.thicknessRangeInput.element)
            .append(this.thicknessContainer)
            .append(this.roundModeButton)
            .append(this.squareModeButton)
            .css("width", "278px")
            .css("height", "100%")
    }

    setThickness(thickness: number) {
        thickness = clamp(thickness, 1, this.maxSize)
        if(thickness === this.thickness) {
            return
        }

        this.thickness = thickness
        this.thicknessLabel.text(String(this.thickness))

        this.refreshBrush()
        this.manager.setNeedsRedraw()
    }

    mouseDown(x: number, y: number) {
        super.mouseDown(x, y);
        this.onMouse(x, y)
    }

    mouseMove(x: number, y: number) {
        super.mouseMove(x, y)
        this.onMouse(x, y)
    }

    onMouse(x: number, y: number) {
        this.mouseX = x
        this.mouseY = y

        if (this.dragging) {
            this.performDrawing(this.brushX, this.brushY)
        }

        if (this.refreshBrush()) {
            this.manager.setNeedsRedraw()
        }
    }

    performDrawing(x: number, y: number) {
        if (this.oldX !== null) {
            this.trace(this.oldX, this.oldY, x, y, (x, y) => this.draw(x, y))
        } else {
            this.draw(x, y)
        }

        this.oldX = x
        this.oldY = y
    }

    mouseUp(x: number, y: number) {
        super.mouseUp(x, y);

        const map = this.manager.world.getComponent(TilemapComponent).map
        const history = map.getComponent(GameMapHistoryComponent)

        history.commitActions(this.actionName)

        this.oldX = null
        this.oldY = null
    }

    brushRowBoundsFor(column: number) {
        if (this.isSquare) {
            return [0, this.thickness]
        }

        const radius = this.thickness / 2
        const area = Math.ceil(radius)

        let dy = column - radius + 0.5
        let boundary = Math.sqrt(radius ** 2 - dy ** 2)

        if (this.thickness % 2 === 0) {
            boundary = Math.round(boundary)
            return [area - boundary, area + boundary]
        } else {
            boundary = Math.round(boundary + 0.5)
            return [area - boundary, area + boundary - 1]
        }
    }

    draw(x: number, y: number) {
        const map = this.manager.world.getComponent(TilemapComponent).map

        for (let by = 0; by < this.thickness; by++) {

            let row = this.brushRowBoundsFor(by)

            for (let bx = row[0]; bx < row[1]; bx++) {

                let px = x + bx
                let py = y + by

                if (px < 0 || py < 0 || px >= map.width || py >= map.height) continue

                this.fragment(px, py)
            }
        }

        this.manager.setNeedsRedraw()
    }

    fragment(x: number, y: number) {
        const map = this.manager.world.getComponent(TilemapComponent).map

        if ((map.getBlock(x, y).constructor as typeof BlockState).typeId ===
            (this.manager.selectedBlock.constructor as typeof BlockState).typeId)
            return

        let block = this.manager.selectedBlock.clone()

        map.setBlock(x, y, block)
    }

    becomeActive() {
        super.becomeActive()
        this.setCursor("url(static/map-editor/cursors/pencil.png) 0 32, auto")
        this.brushPositionKnown = false
        this.manager.world.appendChild(this.visibleEntity)
    }

    resignActive() {
        super.resignActive();
        this.visibleEntity.removeFromParent()
    }

    refreshBrush() {
        this.brushPositionKnown = true

        let brushX = (Math.floor(this.mouseX / GameMap.BLOCK_SIZE))
        let brushY = (Math.floor(this.mouseY / GameMap.BLOCK_SIZE))

        if (this.thickness % 2 !== 0) {
            brushX++
            brushY++
        }

        const radius = this.thickness / 2
        const area = Math.ceil(radius)

        brushX -= area
        brushY -= area

        if (brushX !== this.brushX || brushY !== this.brushY) {
            this.brushX = brushX
            this.brushY = brushY

            return true
        }

        return false
    }
}