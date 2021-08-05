
import Pencil from './pencil';
import AirBlockState from '../../../../map/blockstate/types/airblockstate';
import ToolManager from "../toolmanager";
import BlockState from "../../../../map/blockstate/blockstate";

class Eraser extends Pencil {
    constructor(manager: ToolManager) {
        super(manager);

        this.image = "assets/img/eraser.png"
        this.actionName = "Ластик"
    }

    fragment(x: number, y: number) {
        const map = this.manager.world.map
        if((map.getBlock(x, y).constructor as typeof BlockState).typeId) {
            map.setBlock(x, y, new AirBlockState())
        }
    }

    becomeActive() {
        this.setCursor("url(assets/img/cursors/eraser.png) 0 32, auto")
    }
}

export default Eraser;