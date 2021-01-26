/* @load-resource: './style.css' */

import Screen, {ScreenConfig} from '../screen';

import Progress from '../utils/progress';
import Sprite from '../sprite';
import MapEditorScene from './scenes/mapeditorscene';
import LoadingScene from '../scenes/loading/loadingscene';
import RequestFrameLoop from '../../utils/loop/requestframeloop';
import 'src/client/graphics/drawers/block/type-loader';

import PhysicsUtils from 'src/utils/physicsutils';

class MapEditor extends Screen {
    constructor(config: ScreenConfig) {
        super(config)
    }

    initLoop() {
        this.loop = new RequestFrameLoop()
    }

    initialize() {
        let spriteDownloadProgress = new Progress()
        // let soundDownloadProgress = new Progress()
        let totalProgress = new Progress()
        //
        totalProgress.addSubtask(spriteDownloadProgress)
        // totalProgress.addSubtask(soundDownloadProgress)

        this.setScene(new LoadingScene({
            screen: this,
            progress: totalProgress
        }))

        Sprite.download(spriteDownloadProgress, this.ctx).then(() => {
            Sprite.applyTexture(this.ctx)
            this.setScene(new MapEditorScene({
                screen: this
            }))
            //    return this.soundEngine.download(soundDownloadProgress)
        })
        //     .then(() => {
        //     this.setScene(new GameScene({
        //         screen: this
        //     }))
        // })
    }
}

export default MapEditor