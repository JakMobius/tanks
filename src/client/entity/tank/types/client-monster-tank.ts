
import ClientTank, {TankConfig} from '../client-tank';
import TankDrawer from 'src/client/graphics/drawers/tank-drawer';
import MonsterTankModel from 'src/entity/tanks/models/monster-tank-model';
import Engine from 'src/client/engine';
import FX from 'src/client/sound/fx';
import Sprite from 'src/client/sprite';
import LightMaskTextureProgram from 'src/client/graphics/programs/light-mask-texture/light-mask-texture-program';
import TextureProgram from 'src/client/graphics/programs/texture-program';
import {TankStat} from "../tank-stat";
import Matrix3 from "../../../../utils/matrix3";
import DrawPhase from "../../../graphics/drawers/draw-phase";
import {
    squareQuadrangle,
    translateQuadrangle,
    transformQuadrangle,
    turnQuadrangle,
    multipliedQuadrangle, copyQuadrangle
} from "../../../../utils/quadrangle";
import NastyTankModel from "../../../../entity/tanks/models/nasty-tank-model";
import {Constructor} from "../../../../serialization/binary/serializable";
import WorldDrawer from "../../../graphics/drawers/world-drawer";
import PhysicalComponent from "../../../../entity/entity-physics-component";

class Drawer extends TankDrawer<ClientMonsterTank> {
	public bodyBrightSprite: Sprite;
	public bodyDarkSprite: Sprite;
	public bodyLightMask: Sprite;
    public wheelSprites: Sprite[];

	static bodyQuadrangle  = squareQuadrangle(-2, -2.5, 4,  5)
	static wheelQuadrangle = squareQuadrangle(-0.45, -0.75,  0.9, 1.5)

    static spritesPerMeter = 20
    static wheelSpriteCount = 10

    constructor(tank: ClientMonsterTank, ctx: WebGLRenderingContext) {
        super(tank, ctx);

        this.bodyBrightSprite = Sprite.named("tanks/monster/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/monster/body-dark")
        this.bodyLightMask = Sprite.named("tanks/monster/mask")

        this.wheelSprites = []

        for(let i = 1; i <= Drawer.wheelSpriteCount; i++) {
            this.wheelSprites.push(Sprite.named("tanks/monster/wheel_" + i))
        }
    }

    draw(phase: DrawPhase) {
	    const model = this.entity.model
        const body = model.getComponent(PhysicalComponent).getBody()

        const wheelProgram = phase.getProgram(TextureProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        for(let wheel of model.behaviour.wheels) {
            let spriteIndex = Math.floor(-wheel.distance * Drawer.spritesPerMeter % Drawer.wheelSpriteCount);
            if(spriteIndex < 0) spriteIndex = Drawer.wheelSpriteCount + spriteIndex;
            const position = wheel.position
            const angle = wheel.angle

            const wheelQuadrangle = copyQuadrangle(Drawer.wheelQuadrangle)
            if(angle) turnQuadrangle(wheelQuadrangle, Math.sin(angle), Math.cos(angle))
            translateQuadrangle(wheelQuadrangle, position.x, position.y)
            transformQuadrangle(wheelQuadrangle, model.matrix)

            wheelProgram.drawSprite(this.wheelSprites[spriteIndex], wheelQuadrangle)
        }

        const quadrangle = copyQuadrangle(Drawer.bodyQuadrangle)
        transformQuadrangle(quadrangle, model.matrix)
        bodyProgram.drawMaskedSprite(
            this.bodyBrightSprite,
            this.bodyDarkSprite,
            this.bodyLightMask,
            quadrangle,
            body.GetAngle(),
            WorldDrawer.depths.tankBody
        )
    }
}

export default class ClientMonsterTank extends ClientTank<MonsterTankModel> {
    public static Model = MonsterTankModel

    constructor(options: TankConfig<MonsterTankModel>) {
        super(options);

        this.engine = new Engine({
            sound: FX.ENGINE_1,
            gears: [
                {high: 1.9, gearing: 1},
                {low: 1.4, gearing: 0.8},
            ],
            multiplier: 20,
            pitch: 0.8
        })
    }

    static getDrawer() { return Drawer }
    static getName() { return "Монстр" }
    static getDescription() {
        return "Рассекайте шоссе 66 на монстре! Скоростной пулемёт " +
            "поможет сбить прицел соперника, а мощный двигатель и " +
            "хорошая маневренность позволят оторваться почти от " +
            "любых видов военной техники."
    }

    static getStats() {
        return {
            damage: 4,
            health: 20,
            speed: 46,
            shootrate: 2,
            reload: 7
        }
    }
}