import ClientTank, {TankConfig} from '../client-tank';
import TankDrawer from "../../../graphics/drawers/tank-drawer";
import Sprite from "../../../sprite";
import LightMaskTextureProgram from "../../../graphics/programs/light-mask-texture/light-mask-texture-program";
import TruckProgram from "../../../graphics/programs/truck-program";
import DrawPhase from "../../../graphics/drawers/draw-phase";
import {copyQuadrangle, squareQuadrangle, transformQuadrangle} from "../../../../utils/quadrangle";
import SniperTankModel from "../../../../entity/tanks/models/sniper-tank-model";
import Engine from "../../../engine";
import FX from "../../../sound/fx";
import WorldDrawer from "../../../graphics/drawers/world-drawer";
import PhysicalComponent from "../../../../entity/physics-component";
import TrackTankBehaviour from "../../../../entity/tanks/physics/track-tank/track-tank-behaviour";
import TransformComponent from "../../../../entity/transform-component";

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
            WorldDrawer.depths.tankBody
        )
    }
}

export default class ClientSniperTank extends ClientTank {
    public static Model = SniperTankModel

    constructor(options: TankConfig) {
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

        this.model.addComponent(new Drawer())
    }

    static getName() { return "Снайпер" }
    static getDescription() {
        return "Классический танк. Довольно быстрый и маневренный. " +
                "Его длинное дуло обеспечит точнейший выстрел. Отлично " +
                "подходит для всех ситуаций на поле битвы"
    }
}
