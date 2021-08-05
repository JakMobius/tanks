
import GameMap, {GameMapConfig} from '../../map/gamemap';
import EditorMapBinaryOptions from './editormapbinaryoptions';
import History from './history/history';
import MapBlockModification from './history/modification/mapblockmodification';
import AirBlockState from '../../map/blockstate/types/airblockstate';
import BlockState from "../../map/blockstate/blockstate";

export interface EditorMapConfig extends GameMapConfig {
    name: string
}

class EditorMap extends GameMap {
	public size: any;
	public name: any;
    static BinaryOptions = EditorMapBinaryOptions.shared

    history: History = null
    preventNativeModificationRegistering: boolean = false

    constructor(options: EditorMapConfig) {
        super(options);

        this.size = 0
        this.name = options.name
        this.history = new History()
    }

    static emptyMapData(width: number, height: number) {
        let count = width * height
        let data = new Array(count)

        while(count--) {
            data[count] = new AirBlockState()
        }

        return data
    }

    setBlock(x: number, y: number, data: BlockState) {
        if(!this.preventNativeModificationRegistering)
            this.history.registerModification(
                new MapBlockModification(this, x, y, data)
            )

        super.setBlock(x, y, data);
    }
}

export default EditorMap;