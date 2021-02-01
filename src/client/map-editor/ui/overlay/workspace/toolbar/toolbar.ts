/* @load-resource: './toolbar.scss' */

import View from 'src/client/ui/view';

import BrickBlockState from 'src/utils/map/blockstate/types/brickblockstate';
import BlockSelectOverlay from '../blockselect/blockselectoverlay';
import BlockSelectButton from '../blockselect/blockselectbutton';
import BlockState from "../../../../../../utils/map/blockstate/blockstate";
import Tool from "../../../../tools/tool";
import BlockSelectMenu from "../blockselect/blockselectmenu";

export interface ToolbarViewOptions {
    root: JQuery
}

class ToolbarView extends View {
	public toolList: JQuery;
	public blockSelector: BlockSelectButton;
	public blockSelectOverlay: BlockSelectOverlay;
	public selectedTool: Tool;

    constructor(options: ToolbarViewOptions) {
        super();

        this.element.addClass("editor-toolbar")
        this.toolList = $("<div>").addClass("menu editor-toollist")
        this.blockSelector = new BlockSelectButton()
        this.element.append(this.toolList)
        this.element.append(this.blockSelector.element)

        this.blockSelector.element.on("click", () => {
            this.blockSelectOverlay.show()
        })

        this.blockSelectOverlay = new BlockSelectOverlay({
            root: options.root
        })

        this.blockSelectOverlay.on("select", (block: BlockState) => {
            this.selectBlock(block)
        })

        this.selectedTool = null
    }

    loadSavedBlock() {
        //let savedBlockName = localStorage.getItem("editor-block-name")
        //let savedBlockData = localStorage.getItem("editor-block-data")

        //if(savedBlockData && savedBlockData) {
        //    this.selectBlock(savedBlockName, savedBlockData)
        //} else {
            this.selectBlock(new BrickBlockState())
        //}
    }


    selectBlock(block: BlockState) {
        this.blockSelector.previewBlock(block)
        this.emit("block-select", block)
    }

    /**
     * Adds tool icon to toolbar
     * @param tool {Tool}
     */
    addTool(tool: Tool) {
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

export default ToolbarView;