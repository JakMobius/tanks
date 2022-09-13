import GameMap from "src/map/game-map";

export default class MapModification {

    map: GameMap = null

    constructor(map: GameMap) {
        this.map = map
    }

    perform() {

    }

    revert() {

    }
}