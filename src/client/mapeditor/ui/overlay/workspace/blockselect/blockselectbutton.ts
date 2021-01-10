/* @load-resource: './block-select.scss' */

import View from 'src/client/ui/view';
import BlockState from "../../../../../../utils/map/blockstate/blockstate";

class BlockSelectButton extends View {
    constructor() {
        super();

        this.element.addClass("menu editor-block-select")
    }

    previewBlock(block: BlockState) {
        this.element.css("background-image", "url(../assets/mapeditor/blocks/" + (block.constructor as typeof BlockState).typeName + ".png)")
    }
}

export default BlockSelectButton;