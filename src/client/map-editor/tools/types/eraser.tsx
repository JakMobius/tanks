import Pencil from './pencil';
import AirBlockState from '../../../../map/block-state/types/air-block-state';
import ToolManager from "../toolmanager";
import BlockState from "src/map/block-state/block-state";
import WorldTilemapComponent from 'src/physics/world-tilemap-component';
import TilemapComponent from 'src/map/tilemap-component';

export default class Eraser extends Pencil {
    constructor(manager: ToolManager) {
        super(manager);

        this.image = "static/map-editor/eraser.png"
        this.actionName = "Ластик"
    }

    fragment(x: number, y: number) {
        const map = this.manager.world.getComponent(WorldTilemapComponent).map
        const tilemap = map.getComponent(TilemapComponent)
        if((tilemap.getBlock(x, y).constructor as typeof BlockState).typeId) {
            tilemap.setBlock(x, y, new AirBlockState())
        }
    }

    becomeActive() {
        super.becomeActive()
        this.setCursor("url(static/map-editor/cursors/eraser.png) 0 32, auto")
    }
}