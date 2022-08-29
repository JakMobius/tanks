/* @load-resource: './style.css' */

import MapEditorScene from './scenes/map-editor-scene';
import RequestFrameLoop from '../../utils/loop/request-frame-loop';
import 'src/client/graphics/drawers/block/type-loader';
import 'src/map/block-state/type-loader';
import GeneralGameScreen from "../game/general-game-screen";
import RenderLoop from "../../utils/loop/render-loop";

export default class MapEditorScreen extends GeneralGameScreen {
    public editorScene: MapEditorScene;

    async loadGame() {
        await super.loadGame()

        this.editorScene = new MapEditorScene({
            screen: this
        })
        this.setScene(this.editorScene)
    }
}