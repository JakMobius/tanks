import TankDrawer from "src/client/graphics/drawers/tank-drawer";
import Sprite from "src/client/graphics/sprite";
import {copyQuadrangle, squareQuadrangle, transformQuadrangle} from "src/utils/quadrangle";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import TransformComponent from "src/entity/components/transform-component";
import TruckProgram from "src/client/graphics/programs/truck-program";
import LightMaskTextureProgram from "src/client/graphics/programs/light-mask-texture/light-mask-texture-program";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";

import bodyBrightSprite from "textures/tanks/sniper/body-bright.texture.png"
import bodyDarkSprite from "textures/tanks/sniper/body-dark.texture.png"
import bodyLightMask from "textures/tanks/sniper/mask.texture.png"
import truckSprite from "textures/tanks/sniper/truck.texture.png"

export class Drawer extends TankDrawer {
    public bodyBrightSprite: Sprite;
    public bodyDarkSprite: Sprite;
    public bodyLightMask: Sprite;
    public truckSprite: Sprite;

    static bodyQuadrangle = squareQuadrangle(-1.575, -2.025, 4.5, 4.05)
    static leftTrack = squareQuadrangle(-1.8, -2.25, 4.5, 1.125)
    static rightTrack = squareQuadrangle(-1.8, 1.125, 4.5, 1.125)

    constructor() {
        super();

        this.bodyBrightSprite = Sprite.named(bodyBrightSprite)
        this.bodyDarkSprite = Sprite.named(bodyDarkSprite)
        this.bodyLightMask = Sprite.named(bodyLightMask)
        this.truckSprite = Sprite.named(truckSprite)

        Sprite.setMipMapLevel(0)
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const behaviour = model.getComponent(TrackedTankController)
        const transform = model.getComponent(TransformComponent)

        const truckProgram = phase.getProgram(TruckProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        truckProgram.transform.save()
        bodyProgram.transform.save()

        truckProgram.transform.set(transform.getGlobalTransform())
        bodyProgram.transform.set(transform.getGlobalTransform())

        const leftTrackDist = behaviour.getLeftTrackDistance()
        const rightTrackDist = behaviour.getRightTrackDistance()

        truckProgram.drawTruck(Drawer.leftTrack, leftTrackDist, 0.25, this.truckSprite, 4.0, 0.85)
        truckProgram.drawTruck(Drawer.rightTrack, rightTrackDist, 0.25, this.truckSprite, 4.0, 0.85)
        bodyProgram.drawMaskedSprite(
            this.bodyBrightSprite,
            this.bodyDarkSprite,
            this.bodyLightMask,
            Drawer.bodyQuadrangle,
            transform.getGlobalAngle(),
            WorldDrawerComponent.depths.tankBody
        )

        truckProgram.transform.restore()
        bodyProgram.transform.restore()
    }
}