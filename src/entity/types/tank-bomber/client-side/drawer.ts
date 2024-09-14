import TankDrawer from "src/client/graphics/drawers/tank-drawer";
import Sprite from "src/client/graphics/sprite";
import {copyQuadrangle, squareQuadrangle, transformQuadrangle} from "src/utils/quadrangle";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import TransformComponent from "src/entity/components/transform-component";
import TruckProgram from "src/client/graphics/programs/truck-program";
import TextureProgram from "src/client/graphics/programs/texture-program";

export class Drawer extends TankDrawer {
    public bodyBrightSprite: Sprite;
    //public bodyDarkSprite: Sprite;
    //public bodyLightMask: Sprite;
    public truckSprite: Sprite;

    static bodyQuadrangle = squareQuadrangle(-1.125, -2.25, 2.25, 4.5)
    static leftTrack = squareQuadrangle(1.125, -1.6, 1.36, 3.375)
    static rightTrack = squareQuadrangle(-2.5, -1.6, 1.36, 3.375)

    constructor() {
        super();

        this.bodyBrightSprite = Sprite.named("tanks/bomber/body")
        //this.bodyDarkSprite = Sprite.named("tanks/bomber/body-dark")
        //this.bodyLightMask = Sprite.named("tanks/bomber/mask")
        this.truckSprite = Sprite.named("tanks/bomber/truck")

        Sprite.setMipMapLevel(0)
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const behaviour = this.entity.getComponent(TrackedTankController)
        const transform = model.getComponent(TransformComponent).transform

        const truckProgram = phase.getProgram(TruckProgram)
        const bodyProgram = phase.getProgram(TextureProgram)

        const quadrangle = copyQuadrangle(Drawer.bodyQuadrangle)
        const leftTrack = copyQuadrangle(Drawer.leftTrack)
        const rightTrack = copyQuadrangle(Drawer.rightTrack)

        const leftTrackDist = behaviour.getLeftTrackDistance()
        const rightTrackDist = behaviour.getRightTrackDistance()

        transformQuadrangle(quadrangle, transform)
        transformQuadrangle(leftTrack, transform)
        transformQuadrangle(rightTrack, transform)

        truckProgram.drawTruck(leftTrack, leftTrackDist, 0.25, this.truckSprite, 3.0, 0.85)
        truckProgram.drawTruck(rightTrack, rightTrackDist, 0.25, this.truckSprite, 3.0, 0.85)
        bodyProgram.drawSprite(this.bodyBrightSprite, quadrangle)
        //bodyProgram.drawMaskedSprite(this.bodyBrightSprite, this.bodyDarkSprite, this.bodyLightMask, quadrangle, body.GetAngle())
    }
}