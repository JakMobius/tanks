import SceneScreen from "src/client/graphics/scene-screen";
import LoadingScene from "src/client/scenes/loading/loading-scene";
import DocumentEventHandler from "src/client/controls/interact/document-event-handler";
import {SceneDescriptor} from "src/client/scenes/scene-descriptor";
import PageLocation from "src/client/scenes/page-location";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import Scene from "src/client/scenes/scene";
import {Progress} from "src/client/utils/progress";

export default class SceneController {
    static shared: SceneController = new SceneController()
    currentlyLoading = false
    screen: SceneScreen
    documentEventHandler = new DocumentEventHandler()
    currentSceneName: string | null = null
    sceneDescriptors: Map<string, () => SceneDescriptor> = new Map()
    sceneEventHandler = new BasicEventHandlerSet()

    constructor() {
        this.documentEventHandler.target = window
        this.documentEventHandler.bind("hashchange", () => {
            this.handleWindowLocation()
        })

        this.sceneEventHandler.on("title-set", (title) => {
            document.title = title
        })
    }

    main(root: JQuery<HTMLElement>) {
        this.screen = new SceneScreen({
            root: root,
            scale: window.devicePixelRatio
        })

        this.handleWindowLocation()

        this.screen.loop.start()
    }

    private handleWindowLocation() {
        let sceneName = PageLocation.getHashJson().page ?? "hub"

        if(sceneName === this.currentSceneName) {
            return
        }

        this.currentSceneName = sceneName

        const descriptorFactory = this.sceneDescriptors.get(sceneName)

        if(!descriptorFactory) {
            PageLocation.navigateToScene("hub")
            return
        }

        this.currentlyLoading = true

        const descriptor = descriptorFactory()

        const prerequisites = descriptor.prerequisites.map(resource => {
            return () => {
                console.log(resource.getLocalizedDescription())
                return resource.resolve()
            }
        })

        const progress = Progress.sequential(prerequisites)

        let loadingScene = new LoadingScene({
            progress: progress
        })

        this.showScene(loadingScene)

        progress.on("completed", () => {
            this.showScene(descriptor.createScene())
            this.handleWindowLocation()
            this.currentlyLoading = false
        })

        progress.on("error", (error) => {
            loadingScene.showError(error)
            this.handleWindowLocation()
            this.currentlyLoading = false
        })
    }

    private showScene(scene: Scene) {
        this.sceneEventHandler.setTarget(scene)
        this.screen.setScene(scene)
        this.screen.clear()
        document.title = scene.getTitle()
    }

    registerScene(name: string, descriptorFactory: () => SceneDescriptor) {
        this.sceneDescriptors.set(name, descriptorFactory)
    }
}