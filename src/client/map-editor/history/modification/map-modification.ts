import EditorMap from "../../editor-map";

class MapModification {

    map: EditorMap = null

    constructor(map: EditorMap) {
        this.map = map
    }

    perform() {

    }

    revert() {

    }
}

export default MapModification;