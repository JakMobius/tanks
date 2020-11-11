/* @load-resource: './block-select.scss' */

const View = require("/src/client/ui/view")

class BlockSelectButton extends View {
    constructor() {
        super();

        this.element.addClass("menu editor-block-select")
    }

    previewBlock(block) {
        this.element.css("background-image", "url(../assets/mapeditor/blocks/" + block.constructor.typeName + ".png)")
    }
}

module.exports = BlockSelectButton