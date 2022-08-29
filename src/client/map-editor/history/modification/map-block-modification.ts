import MapModification from './map-modification';
import BlockState from "../../../../map/block-state/block-state";
import GameMap from "../../../../map/game-map";
import GameMapHistoryComponent from "../game-map-history-component";

export default class MapBlockModification extends MapModification {
	public x: any;
	public y: any;
	public oldBlock: any;
	public newBlock: any;

    constructor(map: GameMap, x: number, y: number, newBlock: BlockState) {
        super(map);

        this.x = x
        this.y = y
        this.oldBlock = map.getBlock(x, y)
        this.newBlock = newBlock
    }

    perform() {
        let history = this.map.getComponent(GameMapHistoryComponent)
        history.preventNativeModificationRegistering = true
        this.map.setBlock(this.x, this.y, this.newBlock)
        history.preventNativeModificationRegistering = false
    }

    revert() {
        let history = this.map.getComponent(GameMapHistoryComponent)
        history.preventNativeModificationRegistering = true
        this.map.setBlock(this.x, this.y, this.oldBlock)
        history.preventNativeModificationRegistering = false
    }
}