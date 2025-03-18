import "./toolbar.scss"

import BlockState from "src/map/block-state/block-state";
import Tool from "src/client/map-editor/tools/tool";
import React, { Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ToolManager from 'src/client/map-editor/tools/toolmanager';
import BlockSelectOverlay from "../block-select/block-select-overlay";
import { useMapEditor } from "src/client/map-editor/map-editor-scene";
import Pencil from "src/client/map-editor/tools/types/pencil";
import Drag from "src/client/map-editor/tools/types/drag";
import Eraser from "src/client/map-editor/tools/types/eraser";
import Cursor from "src/client/map-editor/tools/types/cursor";
import BlockSelect from "src/client/map-editor/tools/types/block-select";
import BrickBlockState from "src/map/block-state/types/brick-block-state";
import { useScene } from "src/client/scenes/scene-controller";
import Fill from "src/client/map-editor/tools/types/fill";
import Scale from "src/client/map-editor/tools/types/scale";
import { MapEditorMouseHandler } from "src/client/controls/interact/map-editor-mouse-handler";
import { ControlsProvider } from "src/client/utils/react-controls-responder";
import { ControlsResponder } from "src/client/controls/root-controls-responder";

const ToolBarView: React.FC = React.memo(() => {

    const mapEditor = useMapEditor()
    const mapEditorRef = useRef(mapEditor)
    useEffect(() => { mapEditorRef.current = mapEditor }, [mapEditor])

    const scene = useScene()
    const sceneRef = useRef(scene)
    useEffect(() => { sceneRef.current = scene }, [scene])

    const controlsProvider = useRef<ControlsResponder | null>(null)

    const [state, setState] = useState({
        blockOverlayShown: false,
        selectedBlock: null as BlockState | null,
        selectedTool: null as Tool | null,
        tools: [] as Tool[]
    })

    const onUpdate = () => {
        setState(state => ({
            ...state,
            selectedBlock: toolManager?.selectedBlock,
            selectedTool: toolManager?.selectedTool,
            tools: toolList.filter(tool => tool.isSuitable()) ?? []
        }))
    }

    const [toolManager, toolList] = useMemo(() => {
        let toolManager = new ToolManager()
        toolManager.setEditor(mapEditor)

        let toolList = [
            new Cursor(toolManager),
            new Scale(toolManager),
            new Drag(toolManager),
            new Eraser(toolManager),
            new Pencil(toolManager),
            new Fill(toolManager),
            new BlockSelect(toolManager)
        ]

        toolManager.selectBlock(new BrickBlockState())
        toolManager.setDefaultTool(toolList[0])

        toolManager.on("update", onUpdate)

        return [toolManager, toolList]
    }, [])

    useEffect(() => {
        const setCursor = (cursor: string | null) => {
            let canvas = sceneRef.current.canvas.canvas
            if (canvas instanceof HTMLCanvasElement) {
                canvas.style.cursor = cursor
            }
        }
        const onCursorUpdate = () => {
            setCursor(toolManager.getCursor())
        }

        toolManager.on("cursor", onCursorUpdate)
        return () => setCursor(null)
    }, [])

    const onToolSelect = useCallback((tool: Tool) => {
        toolManager.selectTool(tool)
    }, [])

    const onBlockSelect = useCallback((Block: typeof BlockState) => {
        toolManager.selectBlock(new Block())
    }, [])

    const openBlockSelectOverlay = useCallback(() => {
        setState(state => ({ ...state, blockOverlayShown: true }))
    }, [])

    const selectBlock = useCallback((block: typeof BlockState) => {
        setState(state => ({ ...state, blockOverlayShown: false }))
        onBlockSelect(block)
    }, [onBlockSelect])

    const onDrag = useCallback((dx: number, dy: number) => {
        toolManager.selectedTool?.onDrag(dx, dy)
    }, [])

    const onZoom = useCallback((zoom: number, x: number, y: number) => {
        toolManager.selectedTool?.onZoom(zoom, x, y)
    }, [])

    const onMouseDown = useCallback((x: number, y: number) => {
        toolManager.selectedTool?.onMouseDown(x, y)
    }, [])

    const onMouseUp = useCallback((x: number, y: number) => {
        toolManager.selectedTool?.onMouseUp(x, y)
    }, [])

    const onMouseMove = useCallback((x: number, y: number) => {
        toolManager.selectedTool?.onMouseMove(x, y)
    }, [])

    useEffect(() => {
        controlsProvider.current.on("editor-save", mapEditor.saveMap.bind(mapEditor))
        controlsProvider.current.on("editor-open", mapEditor.openMap.bind(mapEditor))
        controlsProvider.current.on("editor-select-all", mapEditor.selectAll.bind(mapEditor))
        controlsProvider.current.on("editor-delete", mapEditor.deleteSelection.bind(mapEditor))
        controlsProvider.current.on("editor-copy", mapEditor.copy.bind(mapEditor))
        controlsProvider.current.on("editor-paste", mapEditor.paste.bind(mapEditor))
        controlsProvider.current.on("editor-undo", mapEditor.undo.bind(mapEditor))
        controlsProvider.current.on("editor-redo", mapEditor.redo.bind(mapEditor))
    }, [])

    return (
        <ControlsProvider flat ref={controlsProvider}>
            <MapEditorMouseHandler
                onDrag={onDrag}
                onZoom={onZoom}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove} />
            <div className="editor-toolbar">
                <div className="editor-toollist">
                    {state.tools.map((tool, index) => (
                        <div
                            key={tool.name ?? index}
                            className={"tool " + (state.selectedTool === tool ? "selected" : "")}
                            style={{ backgroundImage: `url(${tool.image})` }}
                            onClick={() => onToolSelect(tool)} />
                    ))}
                </div>
            </div>
            {state.blockOverlayShown && <BlockSelectOverlay onBlockSelect={selectBlock} />}
        </ControlsProvider>
    )
})

export default ToolBarView;