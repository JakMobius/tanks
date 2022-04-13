
import MapBinaryOptions from '../../map/map-binary-options';
import FlagHandler from "../../serialization/binary/parsers/flag-handler";

export default class EditorMapBinaryOptions extends MapBinaryOptions {

    NAME_FLAG = 0x0010

    static shared = new EditorMapBinaryOptions()

    constructor() {
        super();

        this.addFlagHandler(this.NAME_FLAG, new FlagHandler()
            .setPacker((encoder, options) => {
                encoder.writeString(options.name || "")
            })
            .setUnpacker((decoder, options) => {
                options.name = decoder.readString()
            })
        )
    }
}