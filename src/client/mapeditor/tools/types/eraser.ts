
import Pencil from './pencil';
import AirBlockState from '../../../../utils/map/blockstate/types/airblockstate';
import ToolManager from "../toolmanager";
import BlockState from "../../../../utils/map/blockstate/blockstate";

class Eraser extends Pencil {
    constructor(manager: ToolManager) {
        super(manager);

        this.image = "../assets/mapeditor/eraser.png"
        this.actionName = "Ластик"
    }

    fragment(x: number, y: number) {
        if((this.manager.map.getBlock(x, y).constructor as typeof BlockState).typeId) {
            this.manager.map.setBlock(x, y, new AirBlockState())
        }
    }

    becomeActive() {
        this.setCursor("url(../assets/mapeditor/cursors/eraser.png) 0 32, auto")
    }
}

export default Eraser;