
import MapBinaryOptions from '../../map/mapbinaryoptions';
import {FlagHandler} from "../../utils/binaryoptions";

class EditorMapBinaryOptions extends MapBinaryOptions {

    NAME_FLAG = 0x0010

    static shared = new EditorMapBinaryOptions()

    constructor() {
        super();

        this.addFlagHandler(new FlagHandler(this.NAME_FLAG)
            .setPacker((encoder, options) => {
                encoder.writeString(options.name || "")
            })
            .setUnpacker((decoder, options) => {
                options.name = decoder.readString()
            })
        )
    }
}

export default EditorMapBinaryOptions;