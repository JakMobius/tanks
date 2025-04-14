import "./block-select.scss"

import TilemapComponent from "src/map/tilemap-component";
import Tool from "../tool";
import ToolManager from "../toolmanager";
import BlockState from "src/map/block-state/block-state";
import { ToolViewProps } from "src/client/ui/tool-settings/tool-settings-view";
import React, { useEffect, useState } from "react";

const BlockSelectToolView: React.FC<ToolViewProps<BlockSelect>> = (props) => {

    let [selectedBlock, setSelectedBlock] = useState(props.tool.manager.getSelectedBlock())

    useEffect(() => {
        let onBlockSelect = (block: BlockState) => {
            setSelectedBlock(block)
        }

        props.tool.manager.on("select-block", onBlockSelect)
        return () => props.tool.manager.off("select-block", onBlockSelect)
    }, [props.tool.manager])

    const onBlockSelect = (Block: typeof BlockState) => {
        props.tool.manager.selectBlock(new Block())
        props.tool.manager.selectPreviousTool()
    }

    let selectedBlockId = (selectedBlock?.constructor as typeof BlockState).typeId

    return (<>
        { Array.from(BlockState.Types.entries()).map(([id, Block]) => {
            return id !== 0 && (
                <div className={"box square button block-box" + (selectedBlockId === id ? " selected" : "")}
                    key={id}
                    style={{ backgroundImage: `url(static/map-editor/blocks/${Block.typeName}.png)` }}
                    onClick={() => onBlockSelect(Block)}
                />
            )
        })}
    </>)
}

export default class BlockSelect extends Tool {
    constructor(manager: ToolManager) {
        super(manager);
        this.settingsView = BlockSelectToolView
        this.shortcutAction = "editor-block-select-tool"

        this.updateImage()

        this.manager.on("select-block", () => this.updateImage())
    }

    updateImage() {
        let blockType = this.manager.selectedBlock?.constructor as typeof BlockState
        this.setImage("/static/map-editor/blocks/" + blockType?.typeName + ".png")
    }

    isSuitable(): boolean {
        return !!this.getOnlySelectedEntity()?.getComponent(TilemapComponent)
    }
}