
const MapModification = require("./mapmodification")

class MapBlockModification extends MapModification {
    constructor(map, x, y, newBlock) {
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

module.exports = MapBlockModification