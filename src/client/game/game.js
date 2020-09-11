/* @load-resource: './style.css' */

const Screen = require("../screen")
const LoadingScene = require("../scenes/loading/loadingscene")
const GameScene = require("./scenes/gamescene")
const Progress = require("../utils/progress")
const Sprite = require("../sprite")

require("/src/utils/physicsutils.js").setupPhysics()

/*
 * At this point we have all necessary modules loaded, so
 * it's time to initialize all dynamic modules. These
 * calls will be transformed into multiple require calls
 * for each file in those directories
 */

require("/src/client/entity/bullet/models/")
require("/src/client/tanks/models/")
require("/src/client/graphics/drawers/block/types/")
require("/src/client/effects/tank/types/")
require("/src/client/effects/world/types/")

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
module.exports = Game

