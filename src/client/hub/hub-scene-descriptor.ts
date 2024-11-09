import SceneController from "src/client/scenes/scene-controller";
import {BasicSceneDescriptor} from "src/client/scenes/scene-descriptor";
import HubScene from "src/client/hub/hub-scene";
import {texturesResourcePrerequisite} from "src/client/scenes/scene-prerequisite";

SceneController.shared.registerScene("hub", () => new BasicSceneDescriptor([
    texturesResourcePrerequisite
], () => {
    return new HubScene()
}));