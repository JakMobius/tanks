
const MapBinaryOptions = require("../../utils/map/mapbinaryoptions")

class EditorMapBinaryOptions extends MapBinaryOptions {

    NAME_FLAG = 0x0010

    static shared = new EditorMapBinaryOptions()

    constructor() {
        super();

        this.addFlagHandler(new MapBinaryOptions.FlagHandler(this.NAME_FLAG)
            .setPacker((encoder, options) => {
                encoder.writeString(options.name || "")
            })
            .setUnpacker((decoder, options) => {
                options.name = decoder.readString()
            })
        )
    }
}

module.exports = EditorMapBinaryOptions