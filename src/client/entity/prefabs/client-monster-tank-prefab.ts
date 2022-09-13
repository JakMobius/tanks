import TankDrawer from 'src/client/graphics/drawers/tank-drawer';
import EngineSoundComponent from 'src/client/entity/components/engine-sound-component';
import Sounds from 'src/client/sound/sounds';
import Sprite from 'src/client/sprite';
import LightMaskTextureProgram from 'src/client/graphics/programs/light-mask-texture/light-mask-texture-program';
import TextureProgram from 'src/client/graphics/programs/texture-program';
import DrawPhase from "../../graphics/drawers/draw-phase";
import {
    copyQuadrangle,
    squareQuadrangle,
    transformQuadrangle,
    translateQuadrangle,
    turnQuadrangle
} from "../../../utils/quadrangle";

import WorldDrawerComponent from "../components/world-drawer-component";
import PhysicalComponent from "../../../entity/components/physics-component";
import WheeledTankBehaviour from "../../../entity/tanks/physics/wheeled-tank/wheeled-tank-behaviour";
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
	public bodyDarkSprite: Sprite;
	public bodyLightMask: Sprite;
    public wheelSprites: Sprite[];

	static bodyQuadrangle  = squareQuadrangle(-2, -2.5, 4,  5)
	static wheelQuadrangle = squareQuadrangle(-0.45, -0.75,  0.9, 1.5)

    static spritesPerMeter = 20
    static wheelSpriteCount = 10

    constructor() {
        super();

        this.bodyBrightSprite = Sprite.named("tanks/monster/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/monster/body-dark")
        this.bodyLightMask = Sprite.named("tanks/monster/mask")

        this.wheelSprites = []

        for(let i = 1; i <= Drawer.wheelSpriteCount; i++) {
            this.wheelSprites.push(Sprite.named("tanks/monster/wheel_" + i))
        }
    }

    draw(phase: DrawPhase) {
	    const model = this.entity
        const body = model.getComponent(PhysicalComponent).getBody()
        const behaviour = model.getComponent(WheeledTankBehaviour)
        const transform = model.getComponent(TransformComponent).transform

        const wheelProgram = phase.getProgram(TextureProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        for(let wheel of behaviour.wheels) {
            let spriteIndex = Math.floor(-wheel.distance * Drawer.spritesPerMeter % Drawer.wheelSpriteCount);
            if(spriteIndex < 0) spriteIndex = Drawer.wheelSpriteCount + spriteIndex;
            const position = wheel.position
            const angle = wheel.angle

            const wheelQuadrangle = copyQuadrangle(Drawer.wheelQuadrangle)
            if(angle) turnQuadrangle(wheelQuadrangle, Math.sin(angle), Math.cos(angle))
            translateQuadrangle(wheelQuadrangle, position.x, position.y)
            transformQuadrangle(wheelQuadrangle, transform)

            wheelProgram.drawSprite(this.wheelSprites[spriteIndex], wheelQuadrangle)
        }

        const quadrangle = copyQuadrangle(Drawer.bodyQuadrangle)
        transformQuadrangle(quadrangle, transform)
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

ClientEntityPrefabs.associate(EntityType.TANK_MONSTER, (entity) => {
    // TODO: bad
    EntityPrefabs.Types.get(EntityType.TANK_MONSTER)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)

    entity.addComponent(new EngineSoundComponent({
        sound: Sounds.ENGINE_3,
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