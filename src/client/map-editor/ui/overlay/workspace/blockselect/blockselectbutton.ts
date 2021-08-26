/* @load-resource: './block-select.scss' */

import BlockState from "src/map/block-state/block-state";
import Menu from "src/client/ui/menu/menu";

export default class BlockSelectButton extends Menu {
    constructor() {
        super();

        this.element.addClass("editor-block-select")
    }

    previewBlock(block: BlockState) {
        this.element.css("background-image", "url(assets/img/blocks/" + (block.constructor as typeof BlockState).typeName + ".png)")
    }
}