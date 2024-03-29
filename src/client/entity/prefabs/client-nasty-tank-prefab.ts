import TankDrawer from 'src/client/graphics/drawers/tank-drawer';
import EngineSoundComponent from 'src/client/entity/components/engine-sound-component';
import Sounds from 'src/client/sound/sounds';
import Sprite from 'src/client/sprite';
import LightMaskTextureProgram from 'src/client/graphics/programs/light-mask-texture/light-mask-texture-program';
import TextureProgram from 'src/client/graphics/programs/texture-program';
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import {
    copyQuadrangle,
    squareQuadrangle,
    transformQuadrangle,
    translateQuadrangle,
    turnQuadrangle
} from "src/utils/quadrangle";
import WorldDrawerComponent from "../components/world-drawer-component";
import PhysicalComponent from "src/entity/components/physics-component";
import TankControls from "src/controls/tank-controls";
import AirbagTankBehaviour from "src/entity/tanks/physics/airbag-tank-behaviour";
import TransformComponent from "src/entity/components/transform-component";
import ClientEntityPrefabs from "../client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EffectHostComponent from "src/effects/effect-host-component";
import DamageSmokeEffect from "../components/damage-smoke-effect";
import EntityPilotListReceiver from "src/entity/components/network/entity-player-list/entity-pilot-list-receiver";

class Drawer extends TankDrawer {
    static bodyQuadrangle           = squareQuadrangle(-2.16,  -2.97, 4.32, 5.94)
    static leftPropellerQuadrangle  = squareQuadrangle(-1.7325,-2.385,1.335,0.18)
    static rightPropellerQuadrangle = squareQuadrangle(0.3825, -2.385, 1.335, 0.18)
    static ruderQuadrangle          = squareQuadrangle(-0.135, -0.99, 0.27, 1.125)

    static ruderXOffset = 1.035
    static ruderYOffset = -2.7225

    static propellerSpriteCount = 4

    static ruderAngle = -Math.PI / 4

    public bodyBrightSprite: Sprite;
    public bodyDarkSprite: Sprite;
    public bodyLightMask: Sprite;
    public ruderSprite: Sprite;
    public propellerSprites: Sprite[];

    constructor() {
        super();

        this.bodyBrightSprite = Sprite.named("tanks/nasty/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/nasty/body-dark")
        this.bodyLightMask = Sprite.named("tanks/nasty/mask")

        this.ruderSprite = Sprite.named("tanks/nasty/ruder")
        this.propellerSprites = []

        for (let i = 1; i <= Drawer.propellerSpriteCount; i++)
            this.propellerSprites.push(Sprite.named("tanks/nasty/propeller_" + i))
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const body = model.getComponent(PhysicalComponent).getBody()
        const controlsComponent = model.getComponent(TankControls)
        const behaviour = model.getComponent(AirbagTankBehaviour)
        const transform = model.getComponent(TransformComponent).transform

        const propellerProgram = phase.getProgram(TextureProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        const propellerDist = behaviour.propellerDist
        const ruderAngle = controlsComponent.getSteer() * Drawer.ruderAngle
        const propeller = this.propellerSprites[Math.round(propellerDist) % Drawer.propellerSpriteCount]

        const bodyQuadrangle = copyQuadrangle(Drawer.bodyQuadrangle)
        const leftRuderQuadrangle = copyQuadrangle(Drawer.ruderQuadrangle)
        const rightRuderQuadrangle = copyQuadrangle(Drawer.ruderQuadrangle)
        const leftPropellerQuadrangle = copyQuadrangle(Drawer.leftPropellerQuadrangle)
        const rightPropellerQuadrangle = copyQuadrangle(Drawer.rightPropellerQuadrangle)

        const ruderSine = Math.sin(ruderAngle)
        const ruderCos = Math.cos(ruderAngle)

        turnQuadrangle(leftRuderQuadrangle, ruderSine, ruderCos)
        turnQuadrangle(rightRuderQuadrangle, ruderSine, ruderCos)
        translateQuadrangle(leftRuderQuadrangle, Drawer.ruderXOffset, Drawer.ruderYOffset)
        translateQuadrangle(rightRuderQuadrangle, -Drawer.ruderXOffset, Drawer.ruderYOffset)

        transformQuadrangle(bodyQuadrangle, transform)
        transformQuadrangle(leftRuderQuadrangle, transform)
        transformQuadrangle(rightRuderQuadrangle, transform)
        transformQuadrangle(leftPropellerQuadrangle, transform)
        transformQuadrangle(rightPropellerQuadrangle, transform)

        bodyProgram.drawMaskedSprite(
            this.bodyBrightSprite,
            this.bodyDarkSprite,
            this.bodyLightMask,
            bodyQuadrangle,
            body.GetAngle(),
            WorldDrawerComponent.depths.tankBody
        )

        propellerProgram.drawSprite(this.ruderSprite, leftRuderQuadrangle, WorldDrawerComponent.depths.tankTop)
        propellerProgram.drawSprite(this.ruderSprite, rightRuderQuadrangle, WorldDrawerComponent.depths.tankTop)
        propellerProgram.drawSprite(propeller, leftPropellerQuadrangle, WorldDrawerComponent.depths.tankTop)
        propellerProgram.drawSprite(propeller, rightPropellerQuadrangle, WorldDrawerComponent.depths.tankTop)
    }
}

ClientEntityPrefabs.associate(EntityType.TANK_NASTY, (entity) => {
    // TODO: bad
    EntityPrefabs.Types.get(EntityType.TANK_NASTY)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)

    entity.addComponent(new EngineSoundComponent({
        sound: Sounds.ENGINE_4,
        multiplier: 5,
        pitch: 0.9,
        volume: 0.6
    }))

    entity.addComponent(new EntityPilotListReceiver())
    entity.addComponent(new Drawer())
    entity.getComponent(EffectHostComponent).addEffect(new DamageSmokeEffect())
})