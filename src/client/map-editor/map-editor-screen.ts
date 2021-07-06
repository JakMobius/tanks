/* @load-resource: './style.css' */

import Sprite from '../sprite';
import MapEditorScene from './scenes/mapeditorscene';
import RequestFrameLoop from '../../utils/loop/requestframeloop';
import 'src/client/graphics/drawers/block/type-loader';
import 'src/utils/map/blockstate/type-loader';
import GeneralGameScreen from "../game/general-game-screen";

export default class MapEditorScreen extends GeneralGameScreen {

    initLoop() {
        this.loop = new RequestFrameLoop()
    }

    async loadGame() {
        await super.loadGame()

        Sprite.applyTexture(this.ctx)
        this.setScene(new MapEditorScene({
            screen: this
        }))
    }
}