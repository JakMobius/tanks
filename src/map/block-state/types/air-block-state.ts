import TilemapComponent from 'src/map/tilemap-component';
import BlockState from '../block-state';

export default class AirBlockState extends BlockState {
    static isSolid = false;
    static typeName = "air";
    static typeId = 0;

    update(map: TilemapComponent, x: number, y: number) {
        map.entity?.emit("block-update", x, y)
    }
}