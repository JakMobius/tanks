import TankDrawer from "src/client/graphics/drawers/tank-drawer";
import Sprite from "src/client/graphics/sprite";
import {copyQuadrangle, squareQuadrangle, transformQuadrangle} from "src/utils/quadrangle";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import TransformComponent from "src/entity/components/transform-component";
import TruckProgram from "src/client/graphics/programs/truck-program";
import LightMaskTextureProgram from "src/client/graphics/programs/light-mask-texture/light-mask-texture-program";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";

export class Drawer extends TankDrawer {
    public bodyBrightSprite: Sprite;
    public bodyDarkSprite: Sprite;
    public bodyLightMask: Sprite;
    public truckSprite: Sprite;

    static bodyQuadrangle = squareQuadrangle(-2.25, -2.07, 4.5, 4.455)
    static leftTrack = squareQuadrangle(1.125, -2.25, 2.25, 4.5)
    static rightTrack = squareQuadrangle(-3.375, -2.25, 2.25, 4.5)

    constructor() {
        super();

        this.bodyBrightSprite = Sprite.named("tanks/bigboi/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/bigboi/body-dark")
        this.bodyLightMask = Sprite.named("tanks/bigboi/mask")
        this.truckSprite = Sprite.named("tanks/bigboi/truck")
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const behaviour = model.getComponent(TrackedTankController)
        const transform = model.getComponent(TransformComponent)

        const truckProgram = phase.getProgram(TruckProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        const leftTrackDist = behaviour.getLeftTrackDistance()
        const rightTrackDist = behaviour.getRightTrackDistance()

        const bodyQuadrangle = copyQuadrangle(Drawer.bodyQuadrangle)
        const leftTrack = copyQuadrangle(Drawer.leftTrack)
        const rightTrack = copyQuadrangle(Drawer.rightTrack)

        transformQuadrangle(leftTrack, transform.transform)
        transformQuadrangle(rightTrack, transform.transform)
        transformQuadrangle(bodyQuadrangle, transform.transform)

        truckProgram.drawTruck(leftTrack, leftTrackDist, 0.25, this.truckSprite, 4, 0.85)
        truckProgram.drawTruck(rightTrack, rightTrackDist, 0.25, this.truckSprite, 4, 0.85)
        bodyProgram.drawMaskedSprite(
            this.bodyBrightSprite,
            this.bodyDarkSprite,
            this.bodyLightMask,
            bodyQuadrangle,
            transform.getAngle(),
            WorldDrawerComponent.depths.tankBody
        )
    }
}