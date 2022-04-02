
import MapModification from './map-modification';
import EditorMap from "../../editor-map";
import BlockState from "../../../../map/block-state/block-state";

class MapBlockModification extends MapModification {
	public x: any;
	public y: any;
	public oldBlock: any;
	public newBlock: any;

    constructor(map: EditorMap, x: number, y: number, newBlock: BlockState) {
        super(map);

        this.x = x
        this.y = y
        this.oldBlock = map.getBlock(x, y)
        this.newBlock = newBlock
    }

    perform() {
        this.map.preventNativeModificationRegistering = true
        this.map.setBlock(this.x, this.y, this.newBlock)
        this.map.preventNativeModificationRegistering = false
    }

    revert() {
        this.map.preventNativeModificationRegistering = true
        this.map.setBlock(this.x, this.y, this.oldBlock)
        this.map.preventNativeModificationRegistering = false
    }
}

export default MapBlockModification;