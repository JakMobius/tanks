
import TankDrawer from "../../../graphics/drawers/tank-drawer";
import Sprite from "../../../sprite";
import LightMaskTextureProgram from "../../../graphics/programs/light-mask-texture/light-mask-texture-program";
import TruckProgram from "../../../graphics/programs/truck-program";
import DrawPhase from "../../../graphics/drawers/draw-phase";
import {copyQuadrangle, squareQuadrangle, transformQuadrangle} from "../../../../utils/quadrangle";
import EngineSoundComponent from "../../components/engine-sound-component";
import Sounds from "../../../sound/sounds";
import WorldDrawerComponent from "../../components/world-drawer-component";
import PhysicalComponent from "../../../../entity/components/physics-component";
import TrackTankBehaviour from "../../../../entity/tanks/physics/track-tank/track-tank-behaviour";
import TransformComponent from "../../../../entity/components/transform-component";
import ClientEntity, {EntityType} from "../../client-entity";
import EntityModel from "../../../../entity/entity-model";
import EffectHostComponent from "../../../../effects/effect-host-component";
import DamageSmokeEffect from "../damage-smoke-effect";
import ClientTank from "../client-tank";

class Drawer extends TankDrawer {
	public bodyBrightSprite: Sprite;
	public bodyDarkSprite: Sprite;
	public bodyLightMask: Sprite;
	public truckSprite: Sprite;

    static bodyQuadrangle = squareQuadrangle(-2.025, -1.575, 4.05, 4.5)
    static leftTrack      = squareQuadrangle(1.125,  -1.8, 1.125, 4.5)
    static rightTrack     = squareQuadrangle(-2.25, -1.8, 1.125, 4.5)

    constructor() {
        super();

        this.bodyBrightSprite = Sprite.named("tanks/sniper/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/sniper/body-dark")
        this.bodyLightMask = Sprite.named("tanks/sniper/mask")
        this.truckSprite = Sprite.named("tanks/sniper/truck")

        Sprite.setMipMapLevel(0)
    }

    draw(phase: DrawPhase) {
	    const model = this.entity
        const body = model.getComponent(PhysicalComponent).getBody()
        const behaviour = model.getComponent(TrackTankBehaviour)
        const transform = model.getComponent(TransformComponent).transform

        const truckProgram = phase.getProgram(TruckProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        const quadrangle = copyQuadrangle(Drawer.bodyQuadrangle)
        const leftTrack  = copyQuadrangle(Drawer.leftTrack)
        const rightTrack = copyQuadrangle(Drawer.rightTrack)

        const leftTrackDist = behaviour.getLeftTrackDistance()
        const rightTrackDist = behaviour.getRightTrackDistance()

        transformQuadrangle(quadrangle, transform)
        transformQuadrangle(leftTrack, transform)
        transformQuadrangle(rightTrack, transform)

        truckProgram.drawTruck(leftTrack, leftTrackDist, 0.25, this.truckSprite, 4.0, 0.85)
        truckProgram.drawTruck(rightTrack, rightTrackDist, 0.25, this.truckSprite, 4.0, 0.85)
        bodyProgram.drawMaskedSprite(
            this.bodyBrightSprite,
            this.bodyDarkSprite,
            this.bodyLightMask,
            quadrangle,
            body.GetAngle(),
            WorldDrawerComponent.depths.tankBody
        )
    }
}

ClientEntity.associate(EntityType.TANK_SNIPER, (model) => {
    // TODO: bad
    EntityModel.Types.get(EntityType.TANK_SNIPER)(model)
    ClientTank.configureEntity(model)

    model.addComponent(new EngineSoundComponent({
        sound: Sounds.ENGINE_2,
        gears: [
            {high: 1.9, gearing: 1},
            {low: 1.4, high: 2, gearing: 0.8},
            {low: 1.4, high: 2, gearing: 0.6},
            {low: 1.4, high: 2, gearing: 0.4},
        ],
        multiplier: 5,
        pitch: 1
    }))

    model.addComponent(new Drawer())
})