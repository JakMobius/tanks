import Pencil from './pencil';
import AirBlockState from '../../../../map/block-state/types/air-block-state';
import ToolManager from "../toolmanager";
import BlockState from "src/map/block-state/block-state";
import TilemapComponent from "src/physics/tilemap-component";

export default class Eraser extends Pencil {
    constructor(manager: ToolManager) {
        super(manager);

        this.image = "static/map-editor/eraser.png"
        this.actionName = "Ластик"
    }

    fragment(x: number, y: number) {
        const map = this.manager.world.getComponent(TilemapComponent).map
        if((map.getBlock(x, y).constructor as typeof BlockState).typeId) {
            map.setBlock(x, y, new AirBlockState())
        }
    }

    becomeActive() {
        super.becomeActive()
        this.setCursor("url(static/map-editor/cursors/eraser.png) 0 32, auto")
    }
}