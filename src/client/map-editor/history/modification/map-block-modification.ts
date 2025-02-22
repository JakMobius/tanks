import MapModification from './map-modification';
import BlockState from "src/map/block-state/block-state";
import GameMapHistoryComponent from "../game-map-history-component";
import TilemapComponent from 'src/map/tilemap-component';
import Entity from 'src/utils/ecs/entity';

export default class MapBlockModification extends MapModification {
	public x: number;
	public y: number;
	public oldBlock: BlockState;
	public newBlock: BlockState;

    constructor(map: Entity, x: number, y: number, oldBlock: BlockState, newBlock: BlockState) {
        super(map);

        this.x = x
        this.y = y
        this.oldBlock = oldBlock
        this.newBlock = newBlock
    }

    perform() {
        let history = this.map.getComponent(GameMapHistoryComponent)
        history.preventNativeModificationRegistering = true
        this.map.getComponent(TilemapComponent).setBlock(this.x, this.y, this.newBlock)
        history.preventNativeModificationRegistering = false
    }

    revert() {
        let history = this.map.getComponent(GameMapHistoryComponent)
        history.preventNativeModificationRegistering = true
        this.map.getComponent(TilemapComponent).setBlock(this.x, this.y, this.oldBlock)
        history.preventNativeModificationRegistering = false
    }
}