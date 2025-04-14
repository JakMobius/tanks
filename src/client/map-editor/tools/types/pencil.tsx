import "./pencil.scss";

import Tool from '../tool';
import ToolManager from "../toolmanager";
import BlockState from "src/map/block-state/block-state";
import Color from "src/utils/color";
import { clamp } from "src/utils/utils";
import { ToolViewProps } from '../../../ui/tool-settings/tool-settings-view';
import React, { useEffect, useState } from 'react';
import RangeView from 'src/client/ui/elements/range/range';
import TilemapComponent from "src/map/tilemap-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import { squareQuadrangleFromPoints } from "src/utils/quadrangle";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import TilemapModificationWatcher from "../../history/tilemap-modification-watcher";

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

    return (<>
        <div className="box">
            <RangeView onChange={onRangeChange} value={rangeValue}/>
            <div className="thickness-text">{props.tool.thickness}</div>
        </div>
        <div 
            className={"box button square round-brush " + (!props.tool.isSquare ? "selected" : "")}
            onClick={onRoundModeClick}/>
        <div className={"box button square square-brush " + (props.tool.isSquare ? "selected" : "")}
            onClick={onSquareModeClick}/>
    </>)
}

export default class Pencil extends Tool {
    public actionName = "Карандаш";
    public image = "/static/map-editor/pencil.png"

    public mouseX = 0
    public mouseY = 0

    // Coordinates of the top-left corner of the brush
    public brushX : number | null = null;
    public brushY : number | null = null;

    public isSquare = false;
    public thickness: number;
    public oldX: number | null = null;
    public oldY: number | null = null;
    public brushColor = new Color().setRGB(0, 1, 0, 0.5)

    cameraDrawCallback = (phase: DrawPhase) => this.drawPreview(phase)

    private modificationWatcher: TilemapModificationWatcher | null = null

    public maxSize = 32

    constructor(manager: ToolManager) {
        super(manager);

        this.settingsView = PencilToolView
        this.shortcutAction = "editor-pencil-tool"

        this.setThickness(1)

        this.controlsResponder.on("editor-increase-brush-size", () => {
            this.setThickness(this.thickness + 1)
        })

        this.controlsResponder.on("editor-decrease-brush-size", () => {
            this.setThickness(this.thickness - 1)
        })

        this.setCursor("url(static/map-editor/pencil.png) 0 18, auto")
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

    onMouseDown(x: number, y: number) {
        super.onMouseDown(x, y);
        if(!this.modificationWatcher) {
            this.modificationWatcher = new TilemapModificationWatcher().listen(this.manager.getOnlySelectedEntity())
        }
        this.onMouse(x, y)
    }

    onMouseMove(x: number, y: number) {
        super.onMouseMove(x, y)
        this.onMouse(x, y)
    }

    onMouse(x: number, y: number) {
        let tilemapTransform = this.manager.getOnlySelectedEntity()?.getComponent(TransformComponent)
        if(!tilemapTransform) return

        let tilemapMatrix = tilemapTransform?.getInvertedGlobalTransform()
        
        this.mouseX = tilemapMatrix.transformX(x, y)
        this.mouseY = tilemapMatrix.transformY(x, y)

        if (this.dragging) {
            this.performDrawing(this.brushX, this.brushY)
        }

        if (this.refreshBrush()) {
            this.manager.setNeedsRedraw()
        }
    }

    performDrawing(x: number, y: number) {
        if (this.oldX !== null) {
            this.trace(this.oldX, this.oldY, x, y, (x, y) => this.drawTilemap(x, y))
        } else {
            this.drawTilemap(x, y)
        }

        this.oldX = x
        this.oldY = y
    }

    onMouseUp(x: number, y: number) {
        super.onMouseUp(x, y);
        if(this.modificationWatcher?.changes.length) {
            let entity = this.getOnlySelectedEntity()
            let modification = this.modificationWatcher.getModification(this.name, entity, this.manager.editor)
            this.manager.editor.getHistoryManager().registerModification(modification)
        }
        this.modificationWatcher?.listen(null)
        this.modificationWatcher = null
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

    drawTilemap(x: number, y: number) {
        const tilemap = this.getTilemap()

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
        const tilemap = this.getTilemap()

        if ((tilemap.getBlock(x, y).constructor as typeof BlockState).typeId ===
            (this.manager.selectedBlock?.constructor as typeof BlockState).typeId)
            return

        let block = this.manager.selectedBlock.clone()

        tilemap.setBlock(x, y, block)
    }

    becomeActive() {
        super.becomeActive()
        this.brushX = null
        this.brushY = null
        let drawer = this.manager.getCamera().getComponent(WorldDrawerComponent)
        drawer.entityDrawPhase.on("draw", this.cameraDrawCallback)
        this.manager.setNeedsRedraw()
    }

    resignActive() {
        super.resignActive();
        this.modificationWatcher?.listen(null)
        this.modificationWatcher = null
        this.brushX = null
        this.brushY = null
        let drawer = this.manager.getCamera().getComponent(WorldDrawerComponent)
        drawer.entityDrawPhase.off("draw", this.cameraDrawCallback)
        this.manager.setNeedsRedraw()
    }

    refreshBrush() {
        let tilemap = this.getTilemap()
        if(!tilemap) {
            this.brushX = null
            this.brushY = null
            return false
        }
        let brushX = tilemap.localToBlockX(this.mouseX)
        let brushY = tilemap.localToBlockY(this.mouseY)

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

    drawPreview(phase: DrawPhase) {
        if (this.brushX === null || this.brushY === null) {
            return
        }

        const program = phase.getProgram(ConvexShapeProgram)

        let transform = this.manager.getOnlySelectedEntity()?.getComponent(TransformComponent)
        program.transform.save()
        program.transform.set(transform.getGlobalTransform())

        const tilemap = this.getTilemap()

        const x = this.brushX
        const y = this.brushY

        let dyStart = Math.max(0, -y)
        let dyEnd = Math.min(this.thickness, tilemap.height - y)

        for (let dy = dyStart; dy < dyEnd; dy++) {
            let bounds = this.brushRowBoundsFor(dy)

            bounds[0] = clamp(bounds[0] + x, 0, tilemap.width)
            bounds[1] = clamp(bounds[1] + x, 0, tilemap.width)

            let quadrangle = squareQuadrangleFromPoints(
                tilemap.blockToLocalX(bounds[0]),
                tilemap.blockToLocalY(y + dy),
                tilemap.blockToLocalX(bounds[1]),
                tilemap.blockToLocalY(y + dy + 1)
            )

            program.drawQuadrangle(quadrangle, this.brushColor.getUint32())
        }

        program.transform.restore()
    }

    getTilemap() {
        return this.getOnlySelectedEntity()?.getComponent(TilemapComponent)
    }
    
    isSuitable(): boolean {
        return !!this.getTilemap()
    }
}