
import MapModification from './map-modification';
import AirBlockState from '../../../../map/block-state/types/air-block-state';
import GameMap from "../../../../map/game-map";
import EditorMap from "../../editor-map";
import Rectangle from "../../../../utils/rectangle";
import BlockState from "../../../../map/block-state/block-state";

class MapAreaModification extends MapModification {
	public area: any;
	public oldData: any;
	public newData: any;

    constructor(map: EditorMap, area: Rectangle, newData: BlockState[]) {
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

    setArea(data: BlockState[]) {
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
                if(data) {
                    this.map.data[destinationIndex++] = data[sourceIndex++]
                } else {
                    this.map.data[destinationIndex++] = new AirBlockState()
                }
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
            }
            destinationIndex -= (width - this.map.width)
        }
    }

    perform() {
        this.setArea(this.newData)
    }

    revert() {
        this.setArea(this.oldData)
    }
}

export default MapAreaModification;