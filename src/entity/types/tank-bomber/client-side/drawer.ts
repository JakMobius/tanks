import TankDrawer from "src/client/graphics/drawers/tank-drawer";
import Sprite from "src/client/graphics/sprite";
import {copyQuadrangle, squareQuadrangle, transformQuadrangle} from "src/utils/quadrangle";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import TransformComponent from "src/entity/components/transform-component";
import TruckProgram from "src/client/graphics/programs/truck-program";
import TextureProgram from "src/client/graphics/programs/texture-program";

import bodyBrightSprite from "textures/tanks/bomber/body.texture.png"
// import bodyDarkSprite from "textures/tanks/bomber/body-dark.texture.png"
// import bodyLightMask from "textures/tanks/bomber/mask.texture.png"
import truckSprite from "textures/tanks/bomber/truck.texture.png"

export class Drawer extends TankDrawer {
    public bodyBrightSprite: Sprite;
    //public bodyDarkSprite: Sprite;
    //public bodyLightMask: Sprite;
    public truckSprite: Sprite;

    static bodyQuadrangle = squareQuadrangle(-2.25, -1.125, 4.5, 2.25)
    static leftTrack = squareQuadrangle(-1.6, -2.5, 3.375, 1.36)
    static rightTrack = squareQuadrangle(-1.6, 1.125, 3.375, 1.36)

    constructor() {
        super();

        this.bodyBrightSprite = Sprite.named(bodyBrightSprite)
        //this.bodyDarkSprite = Sprite.named(bodyDarkSprite)
        //this.bodyLightMask = Sprite.named(bodyLightMask)
        this.truckSprite = Sprite.named(truckSprite)

        Sprite.setMipMapLevel(0)
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const behaviour = this.entity.getComponent(TrackedTankController)
        const transform = model.getComponent(TransformComponent)

        const truckProgram = phase.getProgram(TruckProgram)
        const bodyProgram = phase.getProgram(TextureProgram)

        truckProgram.transform.save()
        bodyProgram.transform.save()

        truckProgram.transform.set(transform.getGlobalTransform())
        bodyProgram.transform.set(transform.getGlobalTransform())

        const leftTrackDist = behaviour.getLeftTrackDistance()
        const rightTrackDist = behaviour.getRightTrackDistance()

        truckProgram.drawTruck(Drawer.leftTrack, leftTrackDist, 0.25, this.truckSprite, 3.0, 0.85)
        truckProgram.drawTruck(Drawer.rightTrack, rightTrackDist, 0.25, this.truckSprite, 3.0, 0.85)
        bodyProgram.drawSprite(this.bodyBrightSprite, Drawer.bodyQuadrangle)
        //bodyProgram.drawMaskedSprite(this.bodyBrightSprite, this.bodyDarkSprite, this.bodyLightMask, quadrangle, body.GetAngle())

        truckProgram.transform.restore()
        bodyProgram.transform.restore
    }
}