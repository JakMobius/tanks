
import ClientTank, {TankConfig} from '../client-tank';
import TankDrawer from "../../../graphics/drawers/tank-drawer";
import Sprite from "../../../sprite";
import DrawPhase from "../../../graphics/drawers/draw-phase";
import TruckProgram from "../../../graphics/programs/truck-program";
import LightMaskTextureProgram from "../../../graphics/programs/light-mask-texture/light-mask-texture-program";
import {
    squareQuadrangle,
    translateQuadrangle,
    transformQuadrangle,
    multipliedQuadrangle, copyQuadrangle
} from "../../../../utils/quadrangle";
import BigBoiTankModel from "../../../../entity/tanks/models/bigboi-tank-model";
import Engine from "../../../engine";
import FX from "../../../sound/fx";
import {TankStat} from "../tank-stat";
import {worker} from "cluster";
import WorldDrawer from "../../../graphics/drawers/world-drawer";
import PhysicalComponent from "../../../../entity/physics-component";
import TrackTankBehaviour from "../../../../entity/tanks/physics/track-tank/track-tank-behaviour";
import TransformComponent from "../../../../entity/transform-component";

class Drawer extends TankDrawer<ClientBigboiTank> {
	public bodyBrightSprite: Sprite;
	public bodyDarkSprite: Sprite;
	public bodyLightMask: Sprite;
	public truckSprite: Sprite;

    static bodyQuadrangle   = squareQuadrangle(-2.25, -2.07, 4.5, 4.455)
    static leftTrack        = squareQuadrangle(1.125,  -2.25, 2.25, 4.5)
    static rightTrack       = squareQuadrangle(-3.375, -2.25, 2.25, 4.5)

    constructor(tank: ClientBigboiTank, ctx: WebGLRenderingContext) {
        super(tank, ctx);

        this.bodyBrightSprite = Sprite.named("tanks/golden-bigboi/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/golden-bigboi/body-dark")
        this.bodyLightMask = Sprite.named("tanks/golden-bigboi/mask")
        this.truckSprite = Sprite.named("tanks/bigboi/truck")
    }

    draw(phase: DrawPhase) {
        const model = this.entity.model
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
            WorldDrawer.depths.tankBody
        )
    }
}

export default class ClientBigboiTank extends ClientTank<BigBoiTankModel> {
    public static Model = BigBoiTankModel

    constructor(options: TankConfig<BigBoiTankModel>) {
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
    static getName() { return "Big Boi" }
    static getDescription() {
        return "Это невероятное чудо техники создано, чтобы " +
            "уничтожать всё на своём пути. Снаряд этого танка, " +
            "имея огромную массу, способен резко изменить " +
            "траекторию движения соперника или вовсе закрутить и обездвижить его."
    }
}