import Tool from '../tool';
import RangeView from '../../../ui/elements/range/range';
import BrushProgram from '../../../graphics/programs/brush-program/brush-program';
import ToolManager from "../toolmanager";
import BlockState from "src/map/block-state/block-state";
import BrushProgramController from "src/client/graphics/programs/brush-program/brush-program-controller";
import Color from "src/utils/color";
import {squareQuadrangleFromPoints} from "src/utils/quadrangle";
import TilemapComponent from "src/physics/tilemap-component";
import GameMap from "src/map/game-map";
import GameMapHistoryComponent from "src/client/map-editor/history/game-map-history-component";

export default class Pencil extends Tool {
	public actionName = "Карандаш";
    public image = "assets/img/pencil.png"

    public brushProgramController: BrushProgramController
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
	public oldX: number;
	public oldY: number;

    constructor(manager: ToolManager) {
        super(manager);

        const brushProgram = new BrushProgram(this.manager.screen.ctx)
        this.brushProgramController = new BrushProgramController(brushProgram, this.manager.camera)
        this.brushProgramController.brushColor = new Color().setRGB(0, 1, 0, 0.5)
        this.brushProgramController.camera = this.manager.camera

        this.setupMenu()
        this.setThickness(1)
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
            .css("background-image", "url(assets/img/round-brush.png)")
            .on("click",() => {
                this.roundModeButton.addClass("selected")
                this.squareModeButton.removeClass("selected")
                this.isSquare = false
            })

        this.squareModeButton = $("<div>")
            .addClass("tool inline")
            .css("background-image", "url(assets/img/square-brush.png)")
            .on("click", () => {
                this.roundModeButton.removeClass("selected")
                this.squareModeButton.addClass("selected")
                this.isSquare = true
            })

        this.thicknessRangeInput.on("value", (value: number) => {
            this.setThickness(Math.round(value * 16) + 1)
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
        this.thickness = thickness
        this.thicknessLabel.text(String(this.thickness))
    }

    mouseDown(x: number, y: number) {
        super.mouseDown(x, y);
        this.onMouse(x, y, false)
    }

    mouseMove(x: number, y: number) {
        this.onMouse(x, y, true)
    }

    onMouse(x: number, y: number, continuous: boolean) {
        this.brushPositionKnown = true

        let blockX
        let blockY

        if (this.thickness % 2 === 0) {
            blockX = (Math.floor(x / GameMap.BLOCK_SIZE + 0.5)) * GameMap.BLOCK_SIZE
            blockY = (Math.floor(y / GameMap.BLOCK_SIZE + 0.5)) * GameMap.BLOCK_SIZE
        } else {
            blockX = (Math.floor(x / GameMap.BLOCK_SIZE) + 0.5) * GameMap.BLOCK_SIZE
            blockY = (Math.floor(y / GameMap.BLOCK_SIZE) + 0.5) * GameMap.BLOCK_SIZE
        }

        if(!continuous || blockX !== this.brushX || blockY !== this.brushY) {
            this.brushX = blockX
            this.brushY = blockY
            if(this.dragging) {
                this.performDrawing(this.brushX, this.brushY, continuous)
            } else {
                this.manager.setNeedsRedraw()
            }
        }
    }

    performDrawing(x: number, y: number, trace: boolean) {
        x = Math.floor(x / GameMap.BLOCK_SIZE)
        y = Math.floor(y / GameMap.BLOCK_SIZE)

        if(trace) {
            this.trace(this.oldX, this.oldY, x, y, (x, y) => this.draw(x, y))
        } else {
            this.draw(x, y)
        }

        this.oldX = x
        this.oldY = y
    }

    mouseUp() {
        super.mouseUp();

        const map = this.manager.world.getComponent(TilemapComponent).map
        const history = map.getComponent(GameMapHistoryComponent)

        history.commitActions(this.actionName)
    }

    draw(x: number, y: number) {
        const map = this.manager.world.getComponent(TilemapComponent).map
        const radius = this.thickness / 2
        const area = Math.ceil(radius)

        let lowX = x - area
        let lowY = y - area
        let highX = Math.min(map.width - 1, x + area - 1)
        let highY = Math.min(map.height - 1, y + area - 1)

        if(this.thickness % 2 !== 0) {
            lowX++
            lowY++
        }

        lowX = Math.max(0, x - area)
        lowY = Math.max(0, y - area)


        if(highX < 0 || highY < 0 || lowX >= map.width || lowY >= map.height) return

        let squareThickness = radius ** 2;

        let sdx = lowX - x;
        let sdy = lowY - y;

        if(this.thickness % 2 === 0) {
            sdx += 0.5;
            sdy += 0.5;
        }

        for(let bx = lowX, dx = sdx; bx <= highX; bx++, dx++) {
            for (let by = lowY, dy = sdy; by <= highY; by++, dy++) {
                if (this.isSquare || dx ** 2 + dy ** 2 <= squareThickness) {
                    this.fragment(bx, by)
                }
            }
        }

        this.manager.setNeedsRedraw()
    }

    fragment(x: number, y: number) {
        const map = this.manager.world.getComponent(TilemapComponent).map

        if((map.getBlock(x, y).constructor as typeof BlockState).typeId ===
            (this.manager.selectedBlock.constructor as typeof BlockState).typeId)
            return

        let block = this.manager.selectedBlock.clone()

        map.setBlock(x, y, block)
    }

    becomeActive() {
        this.setCursor("url(assets/img/cursors/pencil.png) 0 32, auto")
        this.brushPositionKnown = false
    }

    drawDecorations() {
        const map = this.manager.world.getComponent(TilemapComponent).map

        const s = GameMap.BLOCK_SIZE
        const x = this.brushX / s
        const y = this.brushY / s

        const radius = this.thickness / 2

        const lowX = Math.max(0, x - radius)
        const lowY = Math.max(0, y - radius)
        const highX = Math.min(map.width, x + radius)
        const highY = Math.min(map.height, y + radius)

        if(highX < 0 || highY < 0 || lowX >= map.width || lowY >= map.height) return

        this.brushProgramController.brushBounds = squareQuadrangleFromPoints(lowX * s, lowY * s, highX * s, highY * s)
        this.brushProgramController.brushX = this.brushX
        this.brushProgramController.brushY = this.brushY
        this.brushProgramController.brushIsSquare = this.isSquare
        this.brushProgramController.brushDiameter = this.thickness

        this.brushProgramController.draw()
    }
}