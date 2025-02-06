import './toolbar.scss'

import View from 'src/client/ui/view';

import BrickBlockState from 'src/map/block-state/types/brick-block-state';
import BlockSelectOverlay from 'src/client/map-editor/ui/workspace-overlay/block-select/block-select-overlay';
import BlockSelectButton from 'src/client/map-editor/ui/workspace-overlay/block-select/block-select-button';
import BlockState from "src/map/block-state/block-state";
import Tool from "src/client/map-editor/tools/tool";

export interface ToolbarViewOptions {
    // TODO: remove root
    root: JQuery
}

export default class ToolbarView extends View {
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

        // TODO: Should not use options.root to add more overlays here
        this.blockSelectOverlay = new BlockSelectOverlay()
        options.root.append(this.blockSelectOverlay.element)

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
