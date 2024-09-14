import SceneController from "src/client/scenes/scene-controller";
import {BasicSceneDescriptor} from "src/client/scenes/scene-descriptor";
import TutorialScene from "src/client/tutorial/tutorial-scene";
import {soundResourcePrerequisite, texturesResourcePrerequisite} from "src/client/scenes/scene-prerequisite";

SceneController.shared.registerScene("tutorial", () => new BasicSceneDescriptor([
    soundResourcePrerequisite,
    texturesResourcePrerequisite
], () => {
    return new TutorialScene()
}));