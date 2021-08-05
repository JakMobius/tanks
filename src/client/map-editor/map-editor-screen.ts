/* @load-resource: './style.css' */

import MapEditorScene from './scenes/mapeditorscene';
import RequestFrameLoop from '../../utils/loop/requestframeloop';
import 'src/client/graphics/drawers/block/type-loader';
import 'src/map/blockstate/type-loader';
import GeneralGameScreen from "../game/general-game-screen";

export default class MapEditorScreen extends GeneralGameScreen {
    public editorScene: MapEditorScene;

    initLoop() {
        this.loop = new RequestFrameLoop({
            timeMultiplier: 0.001
        })
    }

    async loadGame() {
        await super.loadGame()

        this.editorScene = new MapEditorScene({
            screen: this
        })
        this.setScene(this.editorScene)
    }
}