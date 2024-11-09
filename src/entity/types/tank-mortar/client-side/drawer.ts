import TankDrawer from "src/client/graphics/drawers/tank-drawer";
import Sprite from "src/client/graphics/sprite";
import {copyQuadrangle, squareQuadrangle, transformQuadrangle} from "src/utils/quadrangle";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import TransformComponent from "src/entity/components/transform-component";
import TruckProgram from "src/client/graphics/programs/truck-program";
import TextureProgram from "src/client/graphics/programs/texture-program";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";

export class Drawer extends TankDrawer {
    public bodySprite: Sprite;
    public truckSprite: Sprite;

    static bodyQuadrangle = squareQuadrangle(-1.575, -1.8, 3.15, 3.6)
    static leftTrack = squareQuadrangle(1.125, -2.25, 1.4, 4.5)
    static rightTrack = squareQuadrangle(-2.525, -2.25, 1.4, 4.5)

    constructor() {
        super();

        this.bodySprite = Sprite.named("tanks/mortar/body")
        this.truckSprite = Sprite.named("tanks/mortar/truck")

        Sprite.setMipMapLevel(0)
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const behaviour = model.getComponent(TrackedTankController)
        const transform = model.getComponent(TransformComponent)

        const truckProgram = phase.getProgram(TruckProgram)
        const bodyProgram = phase.getProgram(TextureProgram)

        const quadrangle = copyQuadrangle(Drawer.bodyQuadrangle)
        const leftTrack = copyQuadrangle(Drawer.leftTrack)
        const rightTrack = copyQuadrangle(Drawer.rightTrack)

        const leftTrackDist = behaviour.getLeftTrackDistance()
        const rightTrackDist = behaviour.getRightTrackDistance()

        transformQuadrangle(quadrangle, transform.transform)
        transformQuadrangle(leftTrack, transform.transform)
        transformQuadrangle(rightTrack, transform.transform)

        truckProgram.drawTruck(leftTrack, leftTrackDist, 0.25, this.truckSprite, 4.0, 0.85)
        truckProgram.drawTruck(rightTrack, rightTrackDist, 0.25, this.truckSprite, 4.0, 0.85)
        bodyProgram.drawSprite(this.bodySprite, quadrangle, WorldDrawerComponent.depths.tankBody)
    }
}