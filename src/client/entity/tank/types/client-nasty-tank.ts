import ClientTank, {TankConfig} from '../client-tank';
import TankDrawer from 'src/client/graphics/drawers/tank-drawer';
import NastyTankModel from 'src/entity/tanks/models/nasty-tank-model';
import Engine from 'src/client/engine';
import FX from 'src/client/sound/fx';
import Sprite from 'src/client/sprite';
import LightMaskTextureProgram from 'src/client/graphics/programs/light-mask-texture/light-mask-texture-program';
import TextureProgram from 'src/client/graphics/programs/texture-program';
import DrawPhase from "../../../graphics/drawers/draw-phase";
import {
    squareQuadrangle,
    translateQuadrangle,
    transformQuadrangle,
    turnQuadrangle,
    copyQuadrangle
} from "../../../../utils/quadrangle";
import WorldDrawer from "../../../graphics/drawers/world-drawer";

class Drawer extends TankDrawer<ClientNastyTank> {
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

    constructor(tank: ClientNastyTank, ctx: WebGLRenderingContext) {
        super(tank, ctx);

        this.bodyBrightSprite = Sprite.named("tanks/nasty/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/nasty/body-dark")
        this.bodyLightMask = Sprite.named("tanks/nasty/mask")

        this.ruderSprite = Sprite.named("tanks/nasty/ruder")
        this.propellerSprites = []

        for (let i = 1; i <= Drawer.propellerSpriteCount; i++)
            this.propellerSprites.push(Sprite.named("tanks/nasty/propeller_" + i))
    }

    draw(phase: DrawPhase) {
        const model = this.entity.model
        const body = model.getBody()

        const propellerProgram = phase.getProgram(TextureProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        const propellerDist = model.behaviour.propellerDist
        const ruderAngle = model.controls.getSteer() * Drawer.ruderAngle
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

        transformQuadrangle(bodyQuadrangle, model.matrix)
        transformQuadrangle(leftRuderQuadrangle, model.matrix)
        transformQuadrangle(rightRuderQuadrangle, model.matrix)
        transformQuadrangle(leftPropellerQuadrangle, model.matrix)
        transformQuadrangle(rightPropellerQuadrangle, model.matrix)

        bodyProgram.drawMaskedSprite(
            this.bodyBrightSprite,
            this.bodyDarkSprite,
            this.bodyLightMask,
            bodyQuadrangle,
            body.GetAngle(),
            WorldDrawer.depths.tankBody
        )

        propellerProgram.drawSprite(this.ruderSprite, leftRuderQuadrangle, WorldDrawer.depths.tankTop)
        propellerProgram.drawSprite(this.ruderSprite, rightRuderQuadrangle, WorldDrawer.depths.tankTop)
        propellerProgram.drawSprite(propeller, leftPropellerQuadrangle, WorldDrawer.depths.tankTop)
        propellerProgram.drawSprite(propeller, rightPropellerQuadrangle, WorldDrawer.depths.tankTop)
    }
}

export default class ClientNastyTank extends ClientTank<NastyTankModel> {
    public static Model = NastyTankModel

    constructor(options: TankConfig<NastyTankModel>) {
        super(options);

        this.engine = new Engine({
            sound: FX.ENGINE_4,
            multiplier: 20,
            pitch: 0.9,
            volume: 0.6
        })
    }

    static getDrawer() {
        return Drawer
    }

    static getName() {
        return "Мерзила"
    }

    static getDescription() {
        return "Любите запах напалма на утрам? Тогда эта машина - " +
            "идеальный выбор для вас! Сложный в управлении, но чудовищно " +
            "разрушительный танк с огнемётом на воздушной подушке."
    }
}