/* @load-resource: '../web/base-style.scss' */

import LoadingScene from '../scenes/loading/loading-scene';
import Sprite from '../sprite';
import SceneScreen from "../graphics/scene-screen";
import {ScreenConfig} from "../graphics/screen";
import DialogOverlay from "../map-editor/ui/overlay/dialog/dialogoverlay";
import Downloader from "../utils/downloader";
import Sounds from "../sound/sounds";
import Progress from "../utils/progress";

export default class GeneralGameScreen extends SceneScreen {

    constructor(config: ScreenConfig) {
        super(config)

        this.startGame().catch((error) => {
            let overlay = new DialogOverlay({
                root: this.root,
                requiresDecision: true
            })

            overlay.dialog.title("Ой...")
            overlay.dialog.text("Произошла ошибка при загрузке игры")
            overlay.dialog.addButton({
                title: "Перезагрузить страницу",
                onclick: () => window.location.reload()
            })

            console.error(error)

            overlay.show()
        })
    }

    async loadGame() {

        let assetsProgress = Sprite.download({
            mipMapLevels: 1
        })

        let soundProgress = Progress.all(Sounds.ALL.map((sound) => Downloader.download(sound.path, (response) => {
            this.soundEngine.context.decodeAudioData(response, (buffer: AudioBuffer) => {
                sound.buffer = buffer;
                sound.engine = this.soundEngine
            });
        }, "arraybuffer")))

        this.setScene(new LoadingScene({
            screen: this,
            progress: Progress.all([assetsProgress, soundProgress])
        }))

        await assetsProgress.toPromise()

        Sprite.applyTexture(this.ctx)
    }

    async startGame() {
        await this.loadGame()
    }
}

