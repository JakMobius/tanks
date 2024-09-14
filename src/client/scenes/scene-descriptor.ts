
import Scene from "src/client/scenes/scene";
import {ScenePrerequisite} from "src/client/scenes/scene-prerequisite";
export class SceneDescriptor {
    prerequisites: ScenePrerequisite[] = []

    constructor() {}

    createScene(): Scene {
        throw new Error("Not implemented")
    }
}

export class BasicSceneDescriptor extends SceneDescriptor {
    lambda: () => Scene

    constructor(prerequisites: ScenePrerequisite[], lambda: () => Scene) {
        super()
        this.prerequisites = prerequisites
        this.lambda = lambda
    }

    createScene() {
        return this.lambda()
    }
}
