import "./toolbar.scss"

import BlockState from "src/map/block-state/block-state";
import Tool from "src/client/map-editor/tools/tool";
import React, { Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ToolManager from 'src/client/map-editor/tools/toolmanager';
import BlockSelectOverlay from "../block-select/block-select-overlay";
import { useMapEditorScene } from "src/client/map-editor/map-editor-scene";
import Pencil from "src/client/map-editor/tools/types/pencil";
import Drag from "src/client/map-editor/tools/types/drag";
import Eraser from "src/client/map-editor/tools/types/eraser";
import Cursor from "src/client/map-editor/tools/types/cursor";
import BlockSelect from "src/client/map-editor/tools/types/block-select";
import BrickBlockState from "src/map/block-state/types/brick-block-state";
import { useScene } from "src/client/scenes/scene-controller";
import Fill from "src/client/map-editor/tools/types/fill";
import Scale from "src/client/map-editor/tools/types/scale";
import Entity from "src/utils/ecs/entity";

export interface ToolBarRef {
    toolManager: ToolManager
}

export interface ToolBarProps {
    ref: Ref<ToolBarRef>
}

const ToolBarView: React.FC<ToolBarProps> = React.memo((props) => {

    const mapEditorScene = useMapEditorScene()
    const mapEditorSceneRef = useRef(mapEditorScene)
    useEffect(() => { mapEditorSceneRef.current = mapEditorScene }, [mapEditorScene])

    const scene = useScene()
    const sceneRef = useRef(scene)
    useEffect(() => { sceneRef.current = scene }, [scene])

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
        toolManager.setClientRoot(mapEditorScene.game.clientWorld)
        toolManager.setServerRoot(mapEditorScene.game.serverGame)
        toolManager.setClientCameraEntity(mapEditorScene.clientCameraEntity)
        toolManager.setDefaultTool(toolList[0])

        const onEntitiesSelect = (entities: Entity[]) => {
            mapEditorSceneRef.current.selectEntities(entities)
            onUpdate()
        }

        if(!toolManager) return undefined

        toolManager.on("select-tool", onUpdate)
        toolManager.on("select-block", onUpdate)
        toolManager.on("select-entities", onEntitiesSelect)
        toolManager.on("redraw", () => mapEditorScene.update())

        return [toolManager, toolList]
    }, [])

    useEffect(() => {
        const setCursor = (cursor: string | null) => {
            let canvas = sceneRef.current.canvas.canvas
            if(canvas instanceof HTMLCanvasElement) {
                canvas.style.cursor = cursor
            }
        }
        const onCursorUpdate = () => {
            setCursor(toolManager.getCursor())
        }

        toolManager.on("cursor", onCursorUpdate)
        return () => setCursor(null)
    }, [])

    useEffect(() => {
        toolManager.setSelectedEntities(mapEditorScene.selectedServerEntities)
        onUpdate()
        toolManager.setNeedsRedraw()
    }, [mapEditorScene.selectedServerEntities])

    useImperativeHandle(props.ref, () => ({ toolManager }), [])

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

    return (<>
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
        {state.blockOverlayShown && <BlockSelectOverlay onBlockSelect={selectBlock}/>}
        </>)
})

 export default ToolBarView;