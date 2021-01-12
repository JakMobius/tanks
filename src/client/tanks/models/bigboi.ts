
import ClientTank, {TankConfig} from '../clienttank';
import TankDrawer from '../../graphics/drawers/tankdrawer';
import BigBoiTankModel from '../../../tanks/models/bigboi';
import Engine from '../../engine';
import FX from '../../sound/fx';
import Sprite from '../../sprite';
import LightMaskTextureProgram from '../../graphics/programs/lightmasktextureprogram';
import TruckProgram from '../../graphics/programs/truckprogram';
import {TankStat} from "../tank-stat";
import TankModel from "../../../tanks/tankmodel";
import Camera from "../../camera";

class Drawer extends TankDrawer {
	public size: number;
	public bodyBrightSprite: Sprite;
	public bodyDarkSprite: Sprite;
	public bodyLightMask: Sprite;
	public truckSprite: Sprite;
	public bodyProgram: LightMaskTextureProgram;
	public truckProgram: TruckProgram;
	public tank: BigboiTank

    constructor(tank: BigboiTank, ctx: WebGLRenderingContext) {
        super(tank, ctx);

        // TODO: временно
        this.tank = tank

        this.size = 9
        this.bodyBrightSprite = Sprite.named("tanks/golden-bigboi/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/golden-bigboi/body-dark")
        this.bodyLightMask = Sprite.named("tanks/golden-bigboi/mask")

        this.truckSprite = Sprite.named("tanks/bigboi/truck")
        this.bodyProgram = new LightMaskTextureProgram("tank-body-drawer", ctx)
        this.truckProgram = new TruckProgram("tank-truck-drawer", ctx)

        this.truckProgram.use()
        this.truckProgram.setSprite(this.truckSprite)
        this.truckProgram.setTruckLength(4.0)
        this.truckProgram.setTruckRadius(0.25)
    }

    draw(camera: Camera, dt: number) {

        let angle = this.tank.model.body.GetAngle()

        camera.matrix.save()

        this.drawSmoke(dt)

        const scale = this.size;
        const dscale = scale * 2;

        let leftTrackDist = this.tank.model.behaviour.details.leftTrackDist
        let rightTrackDist = this.tank.model.behaviour.details.rightTrackDist

        let position = this.tank.model.body.GetPosition()

        camera.matrix.translate(position.x, position.y)
        camera.matrix.rotate(-angle)

        this.truckProgram.use()
        this.truckProgram.prepare()

        this.truckProgram.drawTruck(scale/ 2, -scale, scale, dscale, 4, leftTrackDist)
        this.truckProgram.drawTruck(-scale * 3 / 2, -scale, scale, dscale, 4, rightTrackDist)
        this.truckProgram.matrixUniform.setMatrix(camera.matrix.m)

        this.truckProgram.draw()

        this.bodyProgram.prepare()
        this.bodyProgram.use()

        this.bodyProgram.drawMaskedSprite(this.bodyBrightSprite, this.bodyDarkSprite, this.bodyLightMask,
            -scale, -scale * 0.92, scale * 2, scale * 1.98
        )

        this.bodyProgram.setLightAngle(-angle)
        this.bodyProgram.matrixUniform.setMatrix(camera.matrix.m)
        this.bodyProgram.draw()
        camera.matrix.restore()
    }
}

export interface BigBoiTankConfig extends TankConfig {
    model?: BigBoiTankModel
}

class BigboiTank extends ClientTank {

    public model: BigBoiTankModel

    constructor(options?: BigBoiTankConfig) {
        options = options || {}
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

        // TODO: Временное
        this.setupModel(options.model)
    }

    static getDrawer(): typeof TankDrawer { return Drawer }
    static getModel(): typeof TankModel { return BigBoiTankModel }
    static getName(): string { return "Big Boi" }
    static getDescription(): string {
        return "Это невероятное чудо техники создано, чтобы " +
            "уничтожать всё на своём пути. Снаряд этого танка, " +
            "имея огромную массу, способен резко изменить " +
            "траекторию движения соперника или вовсе закрутить и обездвижить его."
    }

    static getStats(): TankStat {
        return {
            damage: 4,
            health: 20,
            speed: 46,
            shootrate: 2,
            reload: 7
        }
    }
}

export default BigboiTank;