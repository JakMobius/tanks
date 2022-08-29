import MapModification from './map-modification';
import AirBlockState from '../../../../map/block-state/types/air-block-state';
import Rectangle from "../../../../utils/rectangle";
import BlockState from "../../../../map/block-state/block-state";
import GameMap from "../../../../map/game-map";
import GameMapHistoryComponent from "../game-map-history-component";

export default class MapAreaModification extends MapModification {
	public area: Rectangle;
	public oldData: BlockState[];
	public newData: BlockState[];

    constructor(map: GameMap, area: Rectangle, newData: BlockState[]) {
        super(map);

        this.area = area
        this.oldData = this.fetchData()
        this.newData = newData
    }

    fetchData(): BlockState[] {
        let result = []

        let minX = Math.max(0, this.area.minX)
        let minY = Math.max(0, this.area.minY)
        let maxX = Math.min(this.map.width, this.area.maxX)
        let maxY = Math.min(this.map.height, this.area.maxY)

        for(let y = minY; y < maxY; y++) {
            for(let x = minX; x < maxX; x++) {
                result.push(this.map.getBlock(x, y))
            }
        }

        return result
    }

    private setArea(data: BlockState[]) {
        let history = this.map.getComponent(GameMapHistoryComponent)
        history.preventNativeModificationRegistering = true

        let sourceIndex = 0

        let minX = Math.max(0, this.area.minX)
        let minY = Math.max(0, this.area.minY)
        let maxX = Math.min(this.map.width, this.area.maxX)
        let maxY = Math.min(this.map.height, this.area.maxY)
        let width = maxX - minX
        let destinationIndex = minX + minY * this.map.width
        let delta = this.area.width() - width

        // Updating blocks

        for(let y = minY; y < maxY; y++) {
            for(let x = minX; x < maxX; x++) {
                let newBlock: BlockState = data ? data[sourceIndex++] : new AirBlockState()
                this.map.emit("block-will-change", x, y, newBlock)
                this.map.data[destinationIndex++] = newBlock
            }
            destinationIndex -= (width - this.map.width)
            sourceIndex += delta
        }

        // Fast block update

        minX = Math.max(0, this.area.minX - 1)
        minY = Math.max(0, this.area.minY - 1)
        maxX = Math.min(this.map.width, this.area.maxX + 1)
        maxY = Math.min(this.map.height, this.area.maxY + 1)

        width = maxX - minX
        destinationIndex = minX + minY * this.map.width

        for(let y = minY; y < maxY; y++) {
            for(let x = minX; x < maxX; x++) {
                this.map.data[destinationIndex++].update(this.map, x, y)
                this.map.emit("block-change", x, y)
            }
            destinationIndex -= (width - this.map.width)
        }

        history.preventNativeModificationRegistering = false
    }

    perform() {
        this.setArea(this.newData)
    }

    revert() {
        this.setArea(this.oldData)
    }
}