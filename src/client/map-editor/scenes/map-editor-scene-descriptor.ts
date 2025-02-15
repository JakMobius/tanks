import SceneController from "src/client/scenes/scene-controller";
import MapEditorScene from "src/client/map-editor/scenes/map-editor-scene";
import {BasicSceneDescriptor} from "src/client/scenes/scene-descriptor";
import { texturesResourcePrerequisite } from "src/client/scenes/scene-prerequisite";

SceneController.shared.registerScene("map-editor", () => new BasicSceneDescriptor(
    [texturesResourcePrerequisite], () => {
    return new MapEditorScene()
}));
