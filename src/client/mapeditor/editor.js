/* @load-resource: './style.css' */

const Screen = require("../screen")
const Progress = require("../utils/progress")
const Sprite = require("../sprite")
const MapEditorScene = require("./scenes/mapeditorscene")
const LoadingScene = require("../scenes/loading/loadingscene")
const RequestFrameLoop = require("../../utils/loop/requestframeloop")

require("../../utils/physicsutils.js").setupPhysics()
require("/src/client/graphics/drawers/block/types/")

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

window.MapEditor = MapEditor

