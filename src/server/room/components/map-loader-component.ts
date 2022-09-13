import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import GameMap from "src/map/game-map";
import BlockState from "src/map/block-state/block-state";
import BlockChangeEvent from "src/events/block-change-event";

export default class MapLoaderComponent implements Component {
    entity: Entity | null = null
    map: GameMap
    private savedMap: BlockState[] = []

    constructor(map: GameMap) {
        this.map = map
        this.savedMap = new Array(this.map.width * this.map.height).fill(null)

        this.map.on("block-change", (event: BlockChangeEvent) => {
            let index = event.x + event.y * this.map.width
            if(!this.savedMap[index]) this.savedMap[index] = event.oldBlock
        })
    }

    getMap() {
        return this.map
    }

    reloadMap() {
        for(let i = 0; i < this.savedMap.length; i++) {
            let x = i % this.map.width
            let y = (i - x) / this.map.width

            let savedBlock = this.savedMap[i]
            if(savedBlock) {
                savedBlock = savedBlock.clone()
                savedBlock.damage = 0
                this.map.setBlock(x, y, savedBlock)
            } else {
                let currentBlock = this.map.getBlock(x, y)
                if(currentBlock.damage > 0) {
                    let newBlock = currentBlock.clone()
                    newBlock.damage = 0
                    this.map.setBlock(x, y, newBlock)
                }
            }
        }
        this.savedMap = []
    }

    onAttach(entity: Entity) {
        this.entity = entity
    }

    onDetach() {
        this.entity = null
    }
}