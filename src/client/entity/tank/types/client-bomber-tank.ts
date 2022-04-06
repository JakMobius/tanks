import BomberTankModel from "../../../../entity/tanks/models/bomber-tank-model";
import Engine from "../../../engine";
import FX from "../../../sound/fx";
import ClientSniperTank, {SniperTankConfig} from "./client-sniper-tank";
import ClientTank from "../client-tank";
import TankDrawer from "../../../graphics/drawers/tank-drawer";
import Sprite from "../../../sprite";
import {copyQuadrangle, squareQuadrangle, transformQuadrangle} from "../../../../utils/quadrangle";
import DrawPhase from "../../../graphics/drawers/draw-phase";
import TruckProgram from "../../../graphics/programs/truck-program";
import TextureProgram from "../../../graphics/programs/texture-program";
import TrackTankBehaviour from "../../../../entity/tanks/physics/track-tank/track-tank-behaviour";

class Drawer extends TankDrawer {
    public bodyBrightSprite: Sprite;
    //public bodyDarkSprite: Sprite;
    //public bodyLightMask: Sprite;
    public truckSprite: Sprite;

    static bodyQuadrangle = squareQuadrangle(-1.125, -2.25, 2.25, 4.5)
    static leftTrack      = squareQuadrangle(1.125,  -1.6, 1.36, 3.375)
    static rightTrack     = squareQuadrangle(-2.5, -1.6, 1.36, 3.375)

    constructor(tank: ClientSniperTank, ctx: WebGLRenderingContext) {
        super(tank, ctx);

        this.bodyBrightSprite = Sprite.named("tanks/bomber/body")
        //this.bodyDarkSprite = Sprite.named("tanks/bomber/body-dark")
        //this.bodyLightMask = Sprite.named("tanks/bomber/mask")
        this.truckSprite = Sprite.named("tanks/bomber/truck")

        Sprite.setMipMapLevel(0)
    }

    draw(phase: DrawPhase) {
        const model = this.entity.model
        const behaviour = this.entity.model.getComponent(TrackTankBehaviour)
        //const body = model.getComponent(PhysicalComponent).getBody()

        const truckProgram = phase.getProgram(TruckProgram)
        const bodyProgram = phase.getProgram(TextureProgram)

        const quadrangle = copyQuadrangle(Drawer.bodyQuadrangle)
        const leftTrack  = copyQuadrangle(Drawer.leftTrack)
        const rightTrack = copyQuadrangle(Drawer.rightTrack)

        const leftTrackDist = behaviour.getLeftTrackDistance()
        const rightTrackDist = behaviour.getRightTrackDistance()

        transformQuadrangle(quadrangle, model.matrix)
        transformQuadrangle(leftTrack, model.matrix)
        transformQuadrangle(rightTrack, model.matrix)

        truckProgram.drawTruck(leftTrack, leftTrackDist, 0.25, this.truckSprite, 3.0, 0.85)
        truckProgram.drawTruck(rightTrack, rightTrackDist, 0.25, this.truckSprite, 3.0, 0.85)
        bodyProgram.drawSprite(this.bodyBrightSprite, quadrangle)
        //bodyProgram.drawMaskedSprite(this.bodyBrightSprite, this.bodyDarkSprite, this.bodyLightMask, quadrangle, body.GetAngle())
    }
}

export default class ClientBomberTank extends ClientTank<BomberTankModel> {
    public static Model = BomberTankModel

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
    static getName() { return "Бомбер" }
    static getDescription() {
        return "Идеальная машина для партизанской войны! Стены и углы" +
            " - ваши лучшие друзья. Снаряды отскакивают от стен и взрываются" +
            " при столкновении с танком."
    }
}