
import {ScenePrerequisite} from "src/client/scenes/scene-prerequisite";
export class SceneDescriptor {
    prerequisites: ScenePrerequisite[] = []

    constructor() {}

    createScene(): React.ReactNode {
        throw new Error("Not implemented")
    }
}

export class BasicSceneDescriptor extends SceneDescriptor {
    lambda: () => React.ReactNode

    constructor(prerequisites: ScenePrerequisite[], lambda: () => React.ReactNode) {
        super()
        this.prerequisites = prerequisites
        this.lambda = lambda
    }

    createScene() {
        return this.lambda()
    }
}
