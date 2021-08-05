/* @load-resource: '../web/base-style.scss' */

import Sprite from '../sprite';
import '../game/game-loader'
import TutorialScene from "./scenes/tutorial-scene";
import {ScreenConfig} from "../graphics/screen";
import {UserDataRaw} from "../user-data-raw";
import GeneralGameScreen from "../game/general-game-screen";

/* Loading all necessary stuff for the game */
import 'src/entity/tanks/model-loader'
import 'src/client/entity/bullet/model-loader';
import 'src/client/entity/tank/model-loader';
import 'src/client/graphics/drawers/block/type-loader';
import 'src/client/effects/type-loader';
import 'src/effects/model-loader'
import 'src/map/blockstate/type-loader';


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