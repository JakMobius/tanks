
import ClientTank, {TankConfig} from '../client-tank';
import TankDrawer from "../../../graphics/drawers/tank-drawer";
import Sprite from "../../../sprite";
import LightMaskTextureProgram from "../../../graphics/programs/light-mask-texture/light-mask-texture-program";
import TruckProgram from "../../../graphics/programs/truck-program";
import DrawPhase from "../../../graphics/drawers/draw-phase";
import {
    squareQuadrangle,
    transformQuadrangle,
    copyQuadrangle
} from "../../../../utils/quadrangle";
import SniperTankModel from "../../../../entity/tanks/models/sniper-tank-model";
import Engine from "../../../engine";
import FX from "../../../sound/fx";
import WorldDrawer from "../../../graphics/drawers/world-drawer";
import PhysicalComponent from "../../../../entity/entity-physics-component";

class Drawer extends TankDrawer<ClientSniperTank> {
	public bodyBrightSprite: Sprite;
	public bodyDarkSprite: Sprite;
	public bodyLightMask: Sprite;
	public truckSprite: Sprite;

    static bodyQuadrangle = squareQuadrangle(-2.025, -1.575, 4.05, 4.5)
    static leftTrack      = squareQuadrangle(1.125,  -1.8, 1.125, 4.5)
    static rightTrack     = squareQuadrangle(-2.25, -1.8, 1.125, 4.5)

    constructor(tank: ClientSniperTank, ctx: WebGLRenderingContext) {
        super(tank, ctx);

        this.bodyBrightSprite = Sprite.named("tanks/sniper/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/sniper/body-dark")
        this.bodyLightMask = Sprite.named("tanks/sniper/mask")
        this.truckSprite = Sprite.named("tanks/sniper/truck")

        Sprite.setMipMapLevel(0)
    }

    draw(phase: DrawPhase) {
	    const model = this.entity.model
        const body = model.getComponent(PhysicalComponent).getBody()

        const truckProgram = phase.getProgram(TruckProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        const quadrangle = copyQuadrangle(Drawer.bodyQuadrangle)
        const leftTrack  = copyQuadrangle(Drawer.leftTrack)
        const rightTrack = copyQuadrangle(Drawer.rightTrack)

        const leftTrackDist = model.behaviour.getLeftTrackDistance()
        const rightTrackDist = model.behaviour.getRightTrackDistance()

        transformQuadrangle(quadrangle, model.matrix)
        transformQuadrangle(leftTrack, model.matrix)
        transformQuadrangle(rightTrack, model.matrix)

        truckProgram.drawTruck(leftTrack, leftTrackDist, 0.25, this.truckSprite, 4.0, 0.85)
        truckProgram.drawTruck(rightTrack, rightTrackDist, 0.25, this.truckSprite, 4.0, 0.85)
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

export interface SniperTankConfig extends TankConfig<SniperTankModel> {
    model: SniperTankModel
}

export default class ClientSniperTank extends ClientTank<SniperTankModel> {
    public static Model = SniperTankModel

    constructor(options: SniperTankConfig) {
        super(options);

        this.engine = new Engine({
            sound: FX.ENGINE_2,
            gears: [
                {high: 1.9, gearing: 1},
                {low: 1.4, high: 2, gearing: 0.8},
                {low: 1.4, high: 2, gearing: 0.6},
                {low: 1.4, high: 2, gearing: 0.4},
            ],
            multiplier: 20,
            pitch: 1
        })
    }

    static getDrawer() { return Drawer }
    static getName() { return "Снайпер" }
    static getDescription() {
        return "Классический танк. Довольно быстрый и маневренный. " +
                "Его длинное дуло обеспечит точнейший выстрел. Отлично " +
                "подходит для всех ситуаций на поле битвы"
    }
}
