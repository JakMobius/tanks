import SceneController from "src/client/scenes/scene-controller";
import MapEditorScene from "src/client/map-editor/scenes/map-editor-scene";
import {BasicSceneDescriptor} from "src/client/scenes/scene-descriptor";

SceneController.shared.registerScene("map-editor", () => new BasicSceneDescriptor( [], () => {
    return new MapEditorScene()
}));