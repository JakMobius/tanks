import './block-select-overlay.scss'

import BlockState from 'src/map/block-state/block-state';
import React from 'react';

interface BlockSelectOverlayProps {
    onBlockSelect: (block: typeof BlockState) => void
}

const BlockSelectOverlay: React.FC<BlockSelectOverlayProps> = (props) => {
    return (
        <div className="block-select-overlay">
            <div className="editor-block-select-menu">
                <div className="title">Выбор блока</div>
                <div className="block-list">
                    { Array.from(BlockState.Types.entries()).map(([id, Block]) => {
                        return id !== 0 && (
                            <div 
                                key={id}
                                className="block-button" 
                                style={{ backgroundImage: `url(static/map-editor/blocks/${Block.typeName}.png)` }}
                                onClick={() => props.onBlockSelect(Block)}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default BlockSelectOverlay