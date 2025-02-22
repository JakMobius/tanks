import "./pencil.scss";

import Tool from '../tool';
import ToolManager from "../toolmanager";
import BlockState from "src/map/block-state/block-state";
import Color from "src/utils/color";
import { squareQuadrangleFromPoints } from "src/utils/quadrangle";
import GameMapHistoryComponent from "src/client/map-editor/history/game-map-history-component";
import EntityDrawer from "src/client/graphics/drawers/entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import Entity from "src/utils/ecs/entity";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import { clamp } from "src/utils/utils";
import { ToolViewProps } from '../../ui/workspace-overlay/tool-settings/tool-settings-view';
import React, { useEffect, useState } from 'react';
import RangeView from 'src/client/ui/elements/range/range';
import WorldTilemapComponent from "src/physics/world-tilemap-component";
import TilemapComponent from "src/map/tilemap-component";

const PencilToolView: React.FC<ToolViewProps<Pencil>> = (props) => {

    const [state, setState] = useState({})

    const onSquareModeClick = () => {
        props.tool.setIsSquare(true)
    }

    const onRoundModeClick = () => {
        props.tool.setIsSquare(false)
    }

    const onRangeChange = (value: number) => {
        props.tool.setThickness(Math.round(value * (props.tool.maxSize - 1)) + 1)
    }   
    
    const onToolUpdate = () => setState({})

    useEffect(() => {
        const tool = props.tool

        tool.on("thickness-changed", onToolUpdate)
        tool.on("mode-changed", onToolUpdate)

        return () => {
            tool.off("thickness-changed", onToolUpdate)
            tool.off("mode-changed", onToolUpdate)
        }
    }, [props.tool])

    const rangeValue = (props.tool.thickness - 1) / (props.tool.maxSize - 1)

    return (
        <div className="tool-preferences">
            <RangeView onChange={onRangeChange} value={rangeValue}/>
            <div className="thickness-text">{props.tool.thickness}</div>
            <div 
                className={"tool " + (!props.tool.isSquare ? "selected" : "")}
                style={{ backgroundImage: "url(static/map-editor/round-brush.png)" }} 
                onClick={onRoundModeClick}/>
            <div className={"tool " + (props.tool.isSquare ? "selected" : "")} 
                style={{ backgroundImage: "url(static/map-editor/square-brush.png)" }} 
                onClick={onSquareModeClick}/>
        </div>
    )
}

export class PencilDrawer extends EntityDrawer {
    tool: Pencil

    constructor(tool: Pencil) {
        super()

        this.tool = tool
    }

    draw(phase: DrawPhase) {
        if (!this.tool.brushPositionKnown) {
            return
        }

        const program = phase.getProgram(ConvexShapeProgram)

        const map = this.tool.manager.world.getComponent(WorldTilemapComponent).map
        const tilemap = map.getComponent(TilemapComponent)

        const scale = TilemapComponent.BLOCK_SIZE
        const x = this.tool.brushX
        const y = this.tool.brushY

        let dyStart = Math.max(0, -y)
        let dyEnd = Math.min(this.tool.thickness, tilemap.height - y)

        for (let dy = dyStart; dy < dyEnd; dy++) {
            let bounds = this.tool.brushRowBoundsFor(dy)

            bounds[0] = clamp(bounds[0] + x, 0, tilemap.width) * scale
            bounds[1] = clamp(bounds[1] + x, 0, tilemap.width) * scale

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
    public thickness: number;
    public oldX: number | null = null;
    public oldY: number | null = null;
    public brushColor = new Color().setRGB(0, 1, 0, 0.5)

    public maxSize = 32

    public visibleEntity = new Entity()

    constructor(manager: ToolManager) {
        super(manager);

        this.visibleEntity.addComponent(new PencilDrawer(this))
        this.settingsView = PencilToolView

        this.setThickness(1)

        this.controlsEventHandler.on("editor-increase-brush-size", () => {
            this.setThickness(this.thickness + 1)
        })

        this.controlsEventHandler.on("editor-decrease-brush-size", () => {
            this.setThickness(this.thickness - 1)
        })
    }

    setThickness(thickness: number) {
        thickness = clamp(thickness, 1, this.maxSize)
        if (thickness === this.thickness) {
            return
        }

        this.thickness = thickness

        this.refreshBrush()
        this.manager.setNeedsRedraw()
        
        this.emit("thickness-changed", this.thickness)
    }

    setIsSquare(isSquare: boolean) {
        this.isSquare = isSquare
        this.refreshBrush()
        this.manager.setNeedsRedraw()
        this.emit("mode-changed", this.isSquare)
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

        const map = this.manager.world.getComponent(WorldTilemapComponent).map
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
        const map = this.manager.world.getComponent(WorldTilemapComponent).map
        const tilemap = map.getComponent(TilemapComponent)

        for (let by = 0; by < this.thickness; by++) {

            let row = this.brushRowBoundsFor(by)

            for (let bx = row[0]; bx < row[1]; bx++) {

                let px = x + bx
                let py = y + by

                if (px < 0 || py < 0 || px >= tilemap.width || py >= tilemap.height) continue

                this.fragment(px, py)
            }
        }

        this.manager.setNeedsRedraw()
    }

    fragment(x: number, y: number) {
        const map = this.manager.world.getComponent(WorldTilemapComponent).map
        const tilemap = map.getComponent(TilemapComponent)

        if ((tilemap.getBlock(x, y).constructor as typeof BlockState).typeId ===
            (this.manager.selectedBlock.constructor as typeof BlockState).typeId)
            return

        let block = this.manager.selectedBlock.clone()

        tilemap.setBlock(x, y, block)
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

        let brushX = (Math.floor(this.mouseX / TilemapComponent.BLOCK_SIZE))
        let brushY = (Math.floor(this.mouseY / TilemapComponent.BLOCK_SIZE))

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