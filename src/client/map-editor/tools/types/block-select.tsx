import TilemapComponent from "src/map/tilemap-component";
import Tool from "../tool";
import ToolManager from "../toolmanager";
import BlockState from "src/map/block-state/block-state";

export default class BlockSelect extends Tool {
    constructor(manager: ToolManager) {
        super(manager);

        this.updateImage()

        this.manager.on("select-block", () => this.updateImage())
    }

    updateImage() {
        let blockType = this.manager.selectedBlock?.constructor as typeof BlockState
        this.setImage("static/map-editor/blocks/" + blockType?.typeName + ".png")
    }

    isSuitable(): boolean {
        return !!this.getOnlySelectedEntity()?.getComponent(TilemapComponent)
    }
}