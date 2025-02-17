import './block-select-overlay.scss'

import Overlay from "src/client/ui/overlay/overlay";
import BlockState from 'src/map/block-state/block-state';
import ReactDOM from 'react-dom/client';
import React from 'react';

interface BlockSelectMenuProps {
    selectBlock: (block: typeof BlockState) => void
}

const BlockSelectMenu: React.FC<BlockSelectMenuProps> = (props) => {
    return (
        <div className="menu editor-block-select-menu">
            <div className="title">Выбор блока</div>
            <div className="block-list">
                { Array.from(BlockState.Types.entries()).map(([id, Block]) => {
                    return id !== 0 && (
                        <div 
                            key={id}
                            className="block-button" 
                            style={{ backgroundImage: `url(static/map-editor/blocks/${Block.typeName}.png)` }}
                            onClick={() => props.selectBlock(Block)}
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default class BlockSelectOverlay extends Overlay {
	
    reactRoot: ReactDOM.Root

    constructor() {
        super();

        this.reactRoot = ReactDOM.createRoot(this.element[0])
        this.reactRoot.render(<BlockSelectMenu selectBlock={(block) => {
            this.emit("select", block)
            this.hide()
        }}/>)

        this.element.addClass("block-select-overlay")

        this.element.on("keydown", (event: JQuery.TriggeredEvent) => {
            if(event.key === "Escape") {
                this.hide()
            }
        })

        this.element.on("click", (event: JQuery.TriggeredEvent) => {
            if(event.target === this.element[0]) {
                this.hide()
            }
        })
    }
}