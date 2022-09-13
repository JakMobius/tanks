import EngineSoundComponent from "../components/engine-sound-component";
import Sounds from "../../sound/sounds";
import TankDrawer from "../../graphics/drawers/tank-drawer";
import Sprite from "../../sprite";
import {copyQuadrangle, squareQuadrangle, transformQuadrangle} from "../../../utils/quadrangle";
import DrawPhase from "../../graphics/drawers/draw-phase";
import TruckProgram from "../../graphics/programs/truck-program";
import TextureProgram from "../../graphics/programs/texture-program";
import TrackTankBehaviour from "../../../entity/tanks/physics/track-tank/track-tank-behaviour";
import TransformComponent from "../../../entity/components/transform-component";
import ClientEntityPrefabs from "../client-entity-prefabs";
import EntityPrefabs from "../../../entity/entity-prefabs";
import {EntityType} from "../../../entity/entity-type";
import EffectHostComponent from "../../../effects/effect-host-component";
import DamageSmokeEffect from "../components/damage-smoke-effect";
import EntityPilotListReceiver
    from "../../../entity/components/network/entity-player-list/entity-pilot-list-receiver";

class Drawer extends TankDrawer {
    public bodyBrightSprite: Sprite;
    //public bodyDarkSprite: Sprite;
    //public bodyLightMask: Sprite;
    public truckSprite: Sprite;

    static bodyQuadrangle = squareQuadrangle(-1.125, -2.25, 2.25, 4.5)
    static leftTrack      = squareQuadrangle(1.125,  -1.6, 1.36, 3.375)
    static rightTrack     = squareQuadrangle(-2.5, -1.6, 1.36, 3.375)

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
        const behaviour = this.entity.getComponent(TrackTankBehaviour)
        const transform = model.getComponent(TransformComponent).transform
        //const body = model.getComponent(PhysicalComponent).getBody()

        const truckProgram = phase.getProgram(TruckProgram)
        const bodyProgram = phase.getProgram(TextureProgram)

        const quadrangle = copyQuadrangle(Drawer.bodyQuadrangle)
        const leftTrack  = copyQuadrangle(Drawer.leftTrack)
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

ClientEntityPrefabs.associate(EntityType.TANK_BOMBER, (entity) => {
    // TODO: bad
    EntityPrefabs.Types.get(EntityType.TANK_BOMBER)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)

    entity.addComponent(new EngineSoundComponent({
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

    entity.addComponent(new EntityPilotListReceiver())
    entity.addComponent(new Drawer())
    entity.getComponent(EffectHostComponent).addEffect(new DamageSmokeEffect())
})