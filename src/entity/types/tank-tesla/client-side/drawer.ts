import TankDrawer from "src/client/graphics/drawers/tank-drawer";
import Sprite from "src/client/graphics/sprite";
import {copyQuadrangle, squareQuadrangle, transformQuadrangle} from "src/utils/quadrangle";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import TransformComponent from "src/entity/components/transform-component";
import TruckProgram from "src/client/graphics/programs/truck-program";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import TextureProgram from "src/client/graphics/programs/texture-program";

import bodyBrightSprite from "textures/tanks/tesla/body.texture.png"
import truckSprite from "textures/tanks/tesla/truck.texture.png"

export class Drawer extends TankDrawer {
    public bodySprite: Sprite;
    public truckSprite: Sprite;

    static bodyQuadrangle = squareQuadrangle(-2.025, -1.575, 4.05, 4.5)
    static leftTrack = squareQuadrangle(1.125, -1.8, 1.125, 4.5)
    static rightTrack = squareQuadrangle(-2.25, -1.8, 1.125, 4.5)

    constructor() {
        super();

        this.bodySprite = Sprite.named(bodyBrightSprite)
        this.truckSprite = Sprite.named(truckSprite)

        Sprite.setMipMapLevel(0)
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const behaviour = model.getComponent(TrackedTankController)
        const transform = model.getComponent(TransformComponent)

        const truckProgram = phase.getProgram(TruckProgram)
        const bodyProgram = phase.getProgram(TextureProgram)

        truckProgram.transform.save()
        bodyProgram.transform.save()

        truckProgram.transform.set(transform.getGlobalTransform())
        bodyProgram.transform.set(transform.getGlobalTransform())

        const leftTrackDist = behaviour.getLeftTrackDistance()
        const rightTrackDist = behaviour.getRightTrackDistance()

        truckProgram.drawTruck(Drawer.leftTrack, leftTrackDist, 0.25, this.truckSprite, 4.0, 0.85)
        truckProgram.drawTruck(Drawer.rightTrack, rightTrackDist, 0.25, this.truckSprite, 4.0, 0.85)
        bodyProgram.drawSprite(
            this.bodySprite,
            Drawer.bodyQuadrangle,
            WorldDrawerComponent.depths.tankBody
        )

        truckProgram.transform.restore()
        bodyProgram.transform.restore
    }
}