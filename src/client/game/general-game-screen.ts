/* @load-resource: '../web/base-style.scss' */

import LoadingScene from '../scenes/loading/loading-scene';
import Sprite from '../sprite';

import './game-loader'
import {downloadAssets} from "./game-loader";
import SceneScreen from "../graphics/scene-screen";
import {ScreenConfig} from "../graphics/screen";
import DialogOverlay from "../map-editor/ui/overlay/dialog/dialogoverlay";

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
        let progress = downloadAssets()

        this.setScene(new LoadingScene({
            screen: this,
            progress: progress
        }))

        await progress.toPromise()

        Sprite.applyTexture(this.ctx)
    }

    async startGame() {
        await this.loadGame()
    }
}

