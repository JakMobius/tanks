import './tool-settings-view.scss'

import Tool from "src/client/map-editor/tools/tool";
import React, { useEffect, useState } from 'react';
import ToolManager from 'src/client/map-editor/tools/toolmanager';

export interface ToolViewProps<T extends Tool = Tool> {
    tool: T
}

interface ToolSettingsViewProps {
    toolManager?: ToolManager
}

const ToolSettingsView: React.FC<ToolSettingsViewProps> = React.memo((props) => {

    const [state, setState] = useState({
        style: {
            display: "none",
            opacity: 0
        },
        shown: false,
        displayedView: null as React.FC<ToolViewProps> | null,
        tool: null as Tool | null
    })

    const setDisplayOpacity = (display: boolean, opacity: number) => {
        setState((state) => ({
            ...state,
            style: {
                display: display ? null : "none",
                opacity: opacity
            }
        }))
    }

    const updateTool = () => {
        const tool = props.toolManager?.selectedTool
        setState((state) => ({
            ...state,
            shown: tool?.settingsView !== null,
            displayedView: tool?.settingsView ?? state.displayedView,
            tool: tool
        }))
    }

    useEffect(() => {
        updateTool()
        if(!props.toolManager) return undefined
        props.toolManager.on("select-tool", updateTool)
        return () => props.toolManager.off("select-tool", updateTool)
    }, [props.toolManager])

    useEffect(() => {
        if(!state.shown) {
            setDisplayOpacity(true, 0)
            
            let timeout = setTimeout(() => {
                setDisplayOpacity(false, 0)
            }, 500)

            return () => {
                clearTimeout(timeout)
            }
        } else {
            setDisplayOpacity(true, 1)
            return () => {}
        }
    }, [state.shown])

    return (
        <div className="editor-tool-settings" style={state.style}>
            {state.displayedView ? <state.displayedView tool={state.tool}/> : null}
        </div>
    )
})

export default ToolSettingsView