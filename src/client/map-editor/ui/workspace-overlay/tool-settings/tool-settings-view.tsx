import './tool-settings-view.scss'

import Tool from "src/client/map-editor/tools/tool";
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import View from 'src/client/ui/view';

export interface ToolViewProps<T extends Tool = Tool> {
    tool: T
}

interface ToolSettingsViewProps {
    tool?: Tool
}

const ToolSettingsViewComponent: React.FC<ToolSettingsViewProps> = (props) => {

    const [state, setState] = useState({
        style: {
            display: "none",
            opacity: 0
        },
        shown: false,
        displayedView: null as React.FC<ToolViewProps> | null
    })

    const setDisplayOpacity = (display: boolean, opacity: number) => {
        setState((state) => ({
            ...state,
            style: {
                display: display ? "block" : "none",
                opacity: opacity
            }
        }))
    }

    useEffect(() => {
        setState((state) => ({
            ...state,
            shown: props.tool?.settingsView !== null,
            displayedView: props.tool?.settingsView ?? state.displayedView
        }))
    }, [props.tool])

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
        <div className="menu editor-tool-settings" style={state.style}>
            {state.displayedView ? <state.displayedView tool={props.tool}/> : null}
        </div>
    );
}

export default class ToolSettingsView extends View {
	
    props: ToolSettingsViewProps = {};
    reactRoot: ReactDOM.Root;

    constructor() {
        super();

        this.reactRoot = ReactDOM.createRoot(this.element[0]);    
        this.render()    
    }

    render() {
        this.reactRoot.render(
            <ToolSettingsViewComponent tool={this.props.tool} />
        )
    }

    setupTool(tool: Tool) {
        this.props.tool = tool;
        this.render();
    }
}