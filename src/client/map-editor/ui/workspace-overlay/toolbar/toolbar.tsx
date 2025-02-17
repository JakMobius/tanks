import './toolbar.scss'

import View from 'src/client/ui/view';

import BrickBlockState from 'src/map/block-state/types/brick-block-state';
import BlockSelectOverlay from 'src/client/map-editor/ui/workspace-overlay/block-select/block-select-overlay';
import BlockState from "src/map/block-state/block-state";
import Tool from "src/client/map-editor/tools/tool";
import React from 'react';
import ReactDOM from 'react-dom/client';

export interface ToolbarViewOptions {
    // TODO: remove root
    root: JQuery
    toolList: Tool[]
}

interface BlockSelectButton {
    block: BlockState
    onClick: () => void
}

const BlockSelectButton: React.FC<BlockSelectButton> = (props) => {
    const blockType = props.block.constructor as typeof BlockState
    return (
        <div 
            className="menu editor-block-select"
            onClick={props.onClick}
            style={{ backgroundImage: `url(static/map-editor/blocks/${blockType.typeName}.png)` }}
        />
    )
}

interface ToolBarViewProps {
    toolList: Tool[]
    selectedTool?: Tool,
    selectedBlock: BlockState
    onToolSelect: (tool: Tool) => void
    selectBlock: () => void
}

const ToolBarViewComponent: React.FC<ToolBarViewProps> = (props) => {
    return (
        <div className="editor-toolbar">
            <div className="menu editor-toollist">
                {props.toolList.map((tool, i) => (
                    <div
                        key={i}
                        className={"tool " + (props.selectedTool === tool ? "selected" : "")}
                        style={{ backgroundImage: `url(${tool.image})` }}
                        onClick={() => props.onToolSelect(tool)} />
                ))}
            </div>
            <BlockSelectButton block={props.selectedBlock} onClick={props.selectBlock}/>
        </div>
    )
}

export default class ToolbarView extends View {
	public blockSelectOverlay: BlockSelectOverlay;
	public selectedTool: Tool;

    toolList: Tool[]
    reactRoot: ReactDOM.Root
    selectedBlock: BlockState

    constructor(options: ToolbarViewOptions) {
        super();

        this.reactRoot = ReactDOM.createRoot(this.element[0])
        this.toolList = options.toolList

        // TODO: Should not use options.root to add more overlays here
        this.blockSelectOverlay = new BlockSelectOverlay()
        options.root.append(this.blockSelectOverlay.element)

        this.blockSelectOverlay.on("select", (Block: typeof BlockState) => {
            this.selectBlock(new Block())
        })

        this.selectedTool = null
        
        this.selectBlock(new BrickBlockState())
    }

    render() {
        this.reactRoot.render(
            <ToolBarViewComponent
                selectBlock={() => this.blockSelectOverlay.show()}
                toolList={this.toolList}
                selectedTool={this.selectedTool}
                selectedBlock={this.selectedBlock}
                onToolSelect={(tool) => {
                    this.selectedTool = tool
                    this.emit("tool-select", tool)
                    this.render()
                }}
            />
        )
    }


    selectBlock(block: BlockState) {
        this.selectedBlock = block
        this.emit("block-select", block)
        this.render()
    }
}
