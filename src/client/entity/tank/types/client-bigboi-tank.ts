
import TankDrawer from "../../../graphics/drawers/tank-drawer";
import Sprite from "../../../sprite";
import DrawPhase from "../../../graphics/drawers/draw-phase";
import TruckProgram from "../../../graphics/programs/truck-program";
import LightMaskTextureProgram from "../../../graphics/programs/light-mask-texture/light-mask-texture-program";
import {copyQuadrangle, squareQuadrangle, transformQuadrangle} from "../../../../utils/quadrangle";
import EngineSoundComponent from "../../components/engine-sound-component";
import Sounds from "../../../sound/sounds";
import WorldDrawerComponent from "../../components/world-drawer-component";
import PhysicalComponent from "../../../../entity/components/physics-component";
import TrackTankBehaviour from "../../../../entity/tanks/physics/track-tank/track-tank-behaviour";
import TransformComponent from "../../../../entity/components/transform-component";
import ClientEntity, {EntityType} from "../../client-entity";
import EntityModel from "../../../../entity/entity-model";
import ClientTank from "../client-tank";

class Drawer extends TankDrawer {
	public bodyBrightSprite: Sprite;
	public bodyDarkSprite: Sprite;
	public bodyLightMask: Sprite;
	public truckSprite: Sprite;

    static bodyQuadrangle   = squareQuadrangle(-2.25, -2.07, 4.5, 4.455)
    static leftTrack        = squareQuadrangle(1.125,  -2.25, 2.25, 4.5)
    static rightTrack       = squareQuadrangle(-3.375, -2.25, 2.25, 4.5)

    constructor() {
        super();

        this.bodyBrightSprite = Sprite.named("tanks/golden-bigboi/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/golden-bigboi/body-dark")
        this.bodyLightMask = Sprite.named("tanks/golden-bigboi/mask")
        this.truckSprite = Sprite.named("tanks/bigboi/truck")
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const body = model.getComponent(PhysicalComponent).getBody()
        const behaviour = model.getComponent(TrackTankBehaviour)
        const transform = model.getComponent(TransformComponent).transform

        const truckProgram = phase.getProgram(TruckProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        const leftTrackDist = behaviour.getLeftTrackDistance()
        const rightTrackDist = behaviour.getRightTrackDistance()

        const bodyQuadrangle = copyQuadrangle(Drawer.bodyQuadrangle)
        const leftTrack      = copyQuadrangle(Drawer.leftTrack)
        const rightTrack     = copyQuadrangle(Drawer.rightTrack)

        transformQuadrangle(leftTrack, transform)
        transformQuadrangle(rightTrack, transform)
        transformQuadrangle(bodyQuadrangle, transform)

        truckProgram.drawTruck(leftTrack, leftTrackDist, 0.25, this.truckSprite, 4, 0.85)
        truckProgram.drawTruck(rightTrack, rightTrackDist, 0.25, this.truckSprite, 4, 0.85)
        bodyProgram.drawMaskedSprite(
            this.bodyBrightSprite,
            this.bodyDarkSprite,
            this.bodyLightMask,
            bodyQuadrangle,
            body.GetAngle(),
            WorldDrawerComponent.depths.tankBody
        )
    }
}

ClientEntity.associate(EntityType.TANK_BIGBOI, (model) => {
    // TODO: bad copypaste
    EntityModel.Types.get(EntityType.TANK_BIGBOI)(model)
    ClientTank.configureEntity(model)

    model.addComponent(new EngineSoundComponent({
        sound: Sounds.ENGINE_1,
        gears: [
            {high: 1.9, gearing: 1},
            {low: 1.4, gearing: 0.8},
        ],
        multiplier: 5,
        pitch: 0.8
    }))

    model.addComponent(new Drawer())
})