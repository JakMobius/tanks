/* @load-resource: './style.css' */

import Screen, {ScreenConfig} from '../screen';

import Progress from '../utils/progress';
import Sprite from '../sprite';
import MapEditorScene from './scenes/mapeditorscene';
import LoadingScene from '../scenes/loading/loadingscene';
import RequestFrameLoop from '../../utils/loop/requestframeloop';
import 'src/client/graphics/drawers/block/type-loader';
import 'src/utils/map/blockstate/type-loader';


class MapEditor extends Screen {
    constructor(config: ScreenConfig) {
        super(config)
    }

    initLoop() {
        this.loop = new RequestFrameLoop()
    }

    initialize() {
        this.loadGame()
    }

    async loadGame() {
        let spriteDownloadProgress = new Progress()
        // let soundDownloadProgress = new Progress()
        let totalProgress = new Progress()

        totalProgress.addSubtask(spriteDownloadProgress)
        // totalProgress.addSubtask(soundDownloadProgress)

        this.setScene(new LoadingScene({
            screen: this,
            progress: totalProgress
        }))

        await Sprite.download(spriteDownloadProgress, this.ctx)
        //await this.soundEngine.download(soundDownloadProgress)

        Sprite.applyTexture(this.ctx)
        this.setScene(new MapEditorScene({
            screen: this
        }))
    }
}

(window as any).MapEditor = MapEditor

export default MapEditor