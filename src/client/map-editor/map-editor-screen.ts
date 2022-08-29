/* @load-resource: './style.css' */

import MapEditorScene from './scenes/map-editor-scene';
import GeneralGameScreen from '../game/general-game-screen';

import 'src/client/game-preloader'

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