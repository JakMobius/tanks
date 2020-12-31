
import Screen from '../screen';
import LoadingScene from '../scenes/loading/loadingscene';
import GameScene from './scenes/gamescene';
import Progress from '../utils/progress';
import Sprite from '../sprite';

require("/src/utils/physicsutils.js").setupPhysics()

/*
 * At this point we have all necessary modules loaded, so
 * it's time to initialize all dynamic modules. These
 * calls will be transformed into multiple require calls
 * for each file in those directories
 */

import '@/client/entity/bullet/models/';

import '@/client/tanks/models/';
import '@/client/graphics/drawers/block/types/';
import '@/client/effects/tank/types/';
import '@/client/effects/world/types/';

class Game extends Screen {
    constructor(config) {
        super(config)
        //this.soundEngine = new SoundEngine()
    }

    initialize() {
        super.initialize()
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

        Sprite.download(spriteDownloadProgress, this.ctx, {
            mipMapLevels: 1
        }).then(() => {
            Sprite.applyTexture(this.ctx, 0)
            this.setScene(new GameScene({
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

window.Game = Game
export default Game;

