
const GameMap = require("../../utils/map/gamemap")
const EditorMapBinaryOptions = require("./editormapbinaryoptions")
const History = require("./history/history")
const MapBlockModification = require("./history/modification/mapblockmodification")
const AirBlockState = require("../../utils/map/blockstate/types/airblockstate")

class EditorMap extends GameMap {

    static BinaryOptions = EditorMapBinaryOptions.shared

    /**
     * @type {History}
     */
    history = null

    /**
     * @type {boolean}
     */
    preventNativeModificationRegistering = false

    constructor(options) {
        super(options);

        if(!options.data) {
            let count = options.width * options.height
            this.data = new Array(count)

            while(count--) {
                this.data[count] = new AirBlockState()
            }
        }

        this.size = 0
        this.name = options.name
        this.history = new History()
    }

    setBlock(x, y, data) {
        if(!this.preventNativeModificationRegistering)
            this.history.registerModification(
                new MapBlockModification(this, x, y, data)
            )

        super.setBlock(x, y, data);
    }
}

module.exports = EditorMap