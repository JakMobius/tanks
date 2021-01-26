/* @load-resource: '../web/base-style.css' */

import Screen, {ScreenConfig} from '../screen';
import LoadingScene from '../scenes/loading/loadingscene';
import GameScene from './scenes/gamescene';
import Progress from '../utils/progress';
import Sprite from '../sprite';

import 'src/tanks/model-loader'
import 'src/client/entity/bullet/model-loader';
import 'src/client/tanks/model-loader';
import 'src/client/graphics/drawers/block/type-loader';
import 'src/client/effects/tank/type-loader';
import 'src/client/effects/world/type-loader';
import 'src/utils/map/blockstate/type-loader';

export interface GameConfig extends ScreenConfig {
    ip: string
}

class GameScreen extends Screen {

    config: GameConfig

    constructor(config: GameConfig) {
        super(config)

        this.config = config
    }

    initialize() {
        super.initialize()
        let spriteDownloadProgress = new Progress()
        //let soundDownloadProgress = new Progress()
        let totalProgress = new Progress()

        totalProgress.addSubtask(spriteDownloadProgress)
        //totalProgress.addSubtask(soundDownloadProgress)

        this.setScene(new LoadingScene({
            screen: this,
            progress: totalProgress
        }))

        Sprite.download(spriteDownloadProgress, this.ctx, {
            mipMapLevels: 1
        }).then(() => {
            Sprite.applyTexture(this.ctx)
            this.setScene(new GameScene({
                screen: this,
                ip: this.config.ip
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

(window as any)["Game"] = GameScreen
export default GameScreen;

