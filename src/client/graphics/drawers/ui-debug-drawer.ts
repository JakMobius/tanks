import DrawPhase from "src/client/graphics/drawers/draw-phase";
import DebugDrawer from "src/client/graphics/drawers/debug-drawer/debug-drawer";
import CameraComponent from "src/client/graphics/camera";
import Screen from "src/client/graphics/screen";

export default class UIDebugDrawer {
    private readonly drawPhase: DrawPhase;
    private camera: CameraComponent;
    private screen: Screen

    constructor(screen: Screen, camera: CameraComponent, drawPhase: DrawPhase) {
        this.screen = screen
        this.drawPhase = drawPhase
    }

    draw() {
        this.drawPhase.prepare()

        this.camera.matrix.save()

        let width = this.screen.width
        let height = this.screen.height

        this.camera.matrix.reset()
        this.camera.matrix.translate(-1, 1)
        this.camera.matrix.scale(1 / width * 2, -1 / height * 2)

        DebugDrawer.instance.plotData.draw(this.drawPhase, width - 300, height - 300, 300, 300)

        this.drawPhase.runPrograms()

        this.camera.matrix.restore()
    }
}