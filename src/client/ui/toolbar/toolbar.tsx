import "./toolbar.scss"

import BlockState from "src/map/block-state/block-state";
import Tool from "src/client/map-editor/tools/tool";
import React, { useCallback, useEffect, useState } from 'react';
import ToolManager from 'src/client/map-editor/tools/toolmanager';
import BlockSelectOverlay from "../block-select/block-select-overlay";

interface BlockSelectButton {
    block?: BlockState
    onClick: () => void
}

const BlockSelectButton: React.FC<BlockSelectButton> = (props) => {
    const blockType = props.block?.constructor as typeof BlockState
    return (
        <div 
            className="editor-block-select"
            onClick={props.onClick}
            style={{ backgroundImage: props.block ? `url(static/map-editor/blocks/${blockType.typeName}.png)` : undefined }}
        />
    )
}

interface ToolBarViewProps {
    toolList: Tool[]
    toolManager: ToolManager
}

const ToolBarView: React.FC<ToolBarViewProps> = React.memo((props) => {

    const [state, setState] = useState({
        blockOverlayShown: false,
        selectedBlock: null as BlockState | null,
        selectedTool: null as Tool | null
    })

    const onToolSelect = useCallback((tool: Tool) => {
        props.toolManager.selectTool(tool)
    }, [props.toolManager])

    const onBlockSelect = useCallback((Block: typeof BlockState) => {
        props.toolManager.selectBlock(new Block())
    }, [props.toolManager])

    const onToolChange = useCallback((tool: Tool) => setState((state) => ({
        ...state,
        selectedTool: tool
    })), [])

    const onBlockChange = useCallback((block: BlockState) => setState((state) => ({
        ...state,
        selectedBlock: block
    })), [])

    useEffect(() => {
        setState(state => ({
            ...state,
            selectedBlock: props.toolManager?.selectedBlock,
            selectedTool: props.toolManager?.selectedTool
        }))

        if(!props.toolManager) return undefined

        props.toolManager.on("select-tool", onToolChange)
        props.toolManager.on("select-block", onBlockChange)

        return () => {
            props.toolManager.off("select-tool", onToolChange)
            props.toolManager.off("select-block", onBlockChange)
        }
    }, [props.toolManager])

    const openBlockSelectOverlay = useCallback(() => {
        setState(state => ({ ...state, blockOverlayShown: true }))
    }, [])

    const selectBlock = useCallback((block: typeof BlockState) => {
        setState(state => ({ ...state, blockOverlayShown: false }))
        onBlockSelect(block)
    }, [onBlockSelect])

    return (<>
        <div className="editor-toolbar">
            <BlockSelectButton block={state.selectedBlock} onClick={openBlockSelectOverlay}/>
            <div className="menu editor-toollist">
                {props.toolList.map((tool, i) => (
                    <div
                        key={i}
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