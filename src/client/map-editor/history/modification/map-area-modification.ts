import MapModification from './map-modification';
import AirBlockState from '../../../../map/block-state/types/air-block-state';
import Rectangle from "src/utils/rectangle";
import BlockState from "src/map/block-state/block-state";
import GameMapHistoryComponent from "../game-map-history-component";
import BlockChangeEvent from "src/events/block-change-event";
import TilemapComponent from 'src/map/tilemap-component';
import Entity from 'src/utils/ecs/entity';

export default class MapAreaModification extends MapModification {
	public area: Rectangle;
	public oldData: BlockState[];
	public newData: BlockState[];

    constructor(map: Entity, area: Rectangle, newData: BlockState[]) {
        super(map);

        this.area = area
        this.oldData = this.fetchData()
        this.newData = newData
    }

    fetchData(): BlockState[] {
        let tilemap = this.map.getComponent(TilemapComponent)
        let result = []

        let minX = Math.max(0, this.area.minX)
        let minY = Math.max(0, this.area.minY)
        let maxX = Math.min(tilemap.width, this.area.maxX)
        let maxY = Math.min(tilemap.height, this.area.maxY)

        for(let y = minY; y < maxY; y++) {
            for(let x = minX; x < maxX; x++) {
                result.push(tilemap.getBlock(x, y))
            }
        }

        return result
    }

    private setArea(data: BlockState[]) {
        let tilemap = this.map.getComponent(TilemapComponent)
        let history = this.map.getComponent(GameMapHistoryComponent)
        history.preventNativeModificationRegistering = true

        let sourceIndex = 0

        let minX = Math.max(0, this.area.minX)
        let minY = Math.max(0, this.area.minY)
        let maxX = Math.min(tilemap.width, this.area.maxX)
        let maxY = Math.min(tilemap.height, this.area.maxY)
        let width = maxX - minX
        let destinationIndex = minX + minY * tilemap.width
        let delta = this.area.width() - width

        // Updating blocks

        let blockChangeEvent = new BlockChangeEvent()

        for(let y = minY; y < maxY; y++) {
            for(let x = minX; x < maxX; x++) {
                let newBlock: BlockState = data ? data[sourceIndex++] : new AirBlockState()

                blockChangeEvent.x = x
                blockChangeEvent.y = y
                blockChangeEvent.newBlock = newBlock
                blockChangeEvent.oldBlock = tilemap.blocks[destinationIndex]

                this.map.emit("block-change", blockChangeEvent)
                tilemap.blocks[destinationIndex++] = newBlock
            }
            destinationIndex -= (width - tilemap.width)
            sourceIndex += delta
        }

        // Fast block update

        minX = Math.max(0, this.area.minX - 1)
        minY = Math.max(0, this.area.minY - 1)
        maxX = Math.min(tilemap.width, this.area.maxX + 1)
        maxY = Math.min(tilemap.height, this.area.maxY + 1)

        width = maxX - minX
        destinationIndex = minX + minY * tilemap.width

        for(let y = minY; y < maxY; y++) {
            for(let x = minX; x < maxX; x++) {
                tilemap.blocks[destinationIndex++].update(tilemap, x, y)
            }
            destinationIndex -= (width - tilemap.width)
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