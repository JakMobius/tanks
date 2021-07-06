/* @load-resource: '../web/base-style.scss' */

import Sprite from '../sprite';
import '../game/game-loader'
import TutorialScene from "./scenes/tutorial-scene";
import {ScreenConfig} from "../graphics/screen";
import {UserDataRaw} from "../user-data-raw";
import GeneralGameScreen from "../game/general-game-screen";

export interface TutorialConfig extends ScreenConfig {
    userData: UserDataRaw
}

export default class TutorialScreen extends GeneralGameScreen {

    config: TutorialConfig

    constructor(config: TutorialConfig) {
        super(config)
        this.config = config
    }

    async startGame() {
        await super.startGame()

        Sprite.applyTexture(this.ctx)

        this.setScene(new TutorialScene({
            screen: this,
            username: this.config.userData.username
        }))
    }
}