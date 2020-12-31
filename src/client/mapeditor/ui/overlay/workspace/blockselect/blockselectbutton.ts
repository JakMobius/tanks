/* @load-resource: './block-select.scss' */

import View from '@/client/ui/view';

class BlockSelectButton extends View {
	public element: any;

    constructor() {
        super();

        this.element.addClass("menu editor-block-select")
    }

    previewBlock(block) {
        this.element.css("background-image", "url(../assets/mapeditor/blocks/" + block.constructor.typeName + ".png)")
    }
}

export default BlockSelectButton;