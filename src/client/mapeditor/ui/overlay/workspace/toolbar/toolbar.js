/* @load-resource: './toolbar.scss' */

const View = require("/src/client/ui/view")
const BrickBlockState = require("/src/utils/map/blockstate/types/brickblockstate")
const BlockSelectOverlay = require("../blockselect/blockselectoverlay")
const BlockSelectButton = require("../blockselect/blockselectbutton")

class ToolbarView extends View {
    constructor(options) {
        super();

        this.element.addClass("editor-toolbar")
        this.toolList = $("<div>").addClass("menu editor-toollist")
        this.blockSelector = new BlockSelectButton()
        this.element.append(this.toolList)
        this.element.append(this.blockSelector.element)

        this.blockSelector.element.click(() => {
            this.blockSelectOverlay.show()
        })

        this.blockSelectOverlay = new BlockSelectOverlay({
            root: options.root
        })

        this.blockSelectOverlay.on("select", (name, block) => {
            this.selectBlock(name, block)
        })

        this.selectedTool = null
    }

    loadSavedBlock() {
        let savedBlockName = localStorage.getItem("editor-block-name")
        let savedBlockData = localStorage.getItem("editor-block-data")

        if(savedBlockData && savedBlockData) {
            this.selectBlock(savedBlockName, savedBlockData)
        } else {
            this.selectBlock(new BrickBlockState())
        }
    }


    selectBlock(block) {
        this.blockSelector.previewBlock(block)
        this.emit("block-select", block)
    }

    /**
     * Adds tool icon to toolbar
     * @param tool {Tool}
     */
    addTool(tool) {
        const self = this

        this.toolList.append(
            $("<div>").addClass("tool")
                .css("background-image", "url(" + tool.image + ")")
                .attr("alt", tool.name)
                .click(function(){
                    const block = $(this)
                    block.closest(".editor-toolbar").find(".tool.selected").removeClass("selected")
                    block.addClass("selected")

                    self.emit("tool-select", tool)
                })
        )
    }
}

module.exports = ToolbarView