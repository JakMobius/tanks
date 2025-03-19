import "./toolbar.scss"

import BlockState from "src/map/block-state/block-state";
import Tool from "src/client/map-editor/tools/tool";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ToolManager from 'src/client/map-editor/tools/toolmanager';
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
import RootControlsResponder, { ControlsResponder } from "src/client/controls/root-controls-responder";
import ToolSettingsView from "../tool-settings/tool-settings-view";
import GameSettings from "src/client/settings/game-settings";
import ControlsPrinter from "src/client/controls/controls-printer";
import { KeyboardInputConfig } from "src/client/controls/input/keyboard/keyboard-controller";

interface ToolViewProps {
    toolManager: ToolManager
    tool: Tool
}

const ToolView: React.FC<ToolViewProps> = (props) => {

    const [altPressed, setAltPressed] = useState(false)

    const onClick = useCallback(() => {
        props.toolManager.selectTool(props.tool)
    }, [props.tool, props.toolManager])

    let isSelected = props.toolManager.selectedTool === props.tool

    let style = useMemo(() => {
        return {
            backgroundImage: `url(${props.tool.image})`
        }
    }, [props.tool.image])

    useEffect(() => {
        const onAltDown = (event: KeyboardEvent) => setAltPressed(event.altKey)
        const onAltUp = (event: KeyboardEvent) => setAltPressed(event.altKey)

        window.addEventListener("keydown", onAltDown)
        window.addEventListener("keyup", onAltUp)

        return () => {
            window.removeEventListener("keydown", onAltDown)
            window.removeEventListener("keyup", onAltUp)
        }
    }, [])

    const shortcut = useMemo(() => {
        if(!props.tool.shortcutAction) return null

        let keyboard = RootControlsResponder.getInstance().keyboard
        let settings = GameSettings.getInstance().controls.getConfigForDevice(keyboard)
        let shortcuts = settings.get(props.tool.shortcutAction) ?? []

        if(shortcuts.length === 0) return null
        let shortcut = shortcuts[0] as KeyboardInputConfig
        
        return ControlsPrinter.getPrintedNameOfKeyboardAxle(shortcut, true)
    }, [props.tool])

    return (
        <div className={"tool " + (isSelected ? "selected" : "")} style={style} onClick={onClick}>
            {
                altPressed ? <div className="tool-shortcut">{shortcut}</div> : null
            }
        </div>
    )
}

const ToolBarView: React.FC = React.memo(() => {

    const mapEditor = useMapEditor()
    const mapEditorRef = useRef(mapEditor)
    useEffect(() => { mapEditorRef.current = mapEditor }, [mapEditor])

    const scene = useScene()
    const sceneRef = useRef(scene)
    useEffect(() => { sceneRef.current = scene }, [scene])

    const controlsProvider = useRef<ControlsResponder | null>(null)

    const [state, setState] = useState({
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

        for(let tool of toolList) {
            if(!tool.shortcutAction) continue
            controlsProvider.current.on(tool.shortcutAction, () => toolManager.selectTool(tool))
        }

        toolManager.getControlsResponder().setParentResponder(controlsProvider.current)

        onUpdate()
    }, [])

    return (
        <ControlsProvider flat ref={controlsProvider}>
            <MapEditorMouseHandler
                onDrag={onDrag}
                onZoom={onZoom}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove} />
            <ToolSettingsView toolManager={toolManager}/>
            <div className="editor-toolbar">
                <div className="editor-toollist">
                    {state.tools.map((tool, index) => (
                        <ToolView tool={tool} key={index} toolManager={toolManager}/>
                    ))}
                </div>
            </div>
        </ControlsProvider>
    )
})

export default ToolBarView;