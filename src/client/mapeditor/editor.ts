/* @load-resource: './style.css' */

import Screen from '../screen';

import Progress from '../utils/progress';
import Sprite from '../sprite';
import MapEditorScene from './scenes/mapeditorscene';
import LoadingScene from '../scenes/loading/loadingscene';
import RequestFrameLoop from '../../utils/loop/requestframeloop';

require("../../utils/physicsutils.js").setupPhysics()
import '@/client/graphics/drawers/block/types/';

class MapEditor extends Screen {
    constructor(config) {
        super(config)
    }

    initLoop() {
        this.loop = new RequestFrameLoop(this)
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
            Sprite.applyTexture(this.ctx, 0)
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