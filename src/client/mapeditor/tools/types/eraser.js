
const Pencil = require("./pencil")
const AirBlockState = require("../../../../utils/map/blockstate/types/airblockstate")

class Eraser extends Pencil {
    constructor(manager) {
        super(manager);

        this.image = "../assets/mapeditor/eraser.png"
        this.actionName = "Ластик"
    }

    fragment(x, y) {
        if(this.manager.map.getBlock(x, y).constructor.typeId) {
            this.manager.map.setBlock(x, y, new AirBlockState())
        }
    }

    becomeActive() {
        this.setCursor("url(../assets/mapeditor/cursors/eraser.png) 0 32, auto")
    }
}

module.exports = Eraser