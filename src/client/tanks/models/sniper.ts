
import ClientTank from '../clienttank';
import TankDrawer from '../../graphics/drawers/tankdrawer';
import SniperTankModel from '../../../tanks/models/sniper';
import Engine from '../../engine';
import FX from '../../sound/fx';
import Sprite from '../../sprite';
import LightMaskTextureProgram from '../../graphics/programs/lightmasktextureprogram';
import TruckProgram from '../../graphics/programs/truckprogram';

class Drawer extends TankDrawer {
	public size: any;
	public bodyBrightSprite: any;
	public bodyDarkSprite: any;
	public bodyLightMask: any;
	public truckSprite: any;
	public bodyProgram: any;
	public truckProgram: any;

    constructor(tank, ctx) {
        super(tank, ctx);

        this.size = 9
        this.bodyBrightSprite = Sprite.named("tanks/sniper/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/sniper/body-dark")
        this.bodyLightMask = Sprite.named("tanks/sniper/mask")

        this.truckSprite = Sprite.named("tanks/sniper/truck")
        this.bodyProgram = new LightMaskTextureProgram("tank-body-drawer", ctx)
        this.truckProgram = new TruckProgram("tank-truck-drawer", ctx)

        Sprite.setMipMapLevel(0)

        this.truckProgram.use()
        this.truckProgram.textureUniform.set1i(0)
        this.truckProgram.setSprite(this.truckSprite)
        this.truckProgram.setTruckLength(4.0)
        this.truckProgram.setTruckRadius(0.25)
    }

    draw(camera, dt) {

        let angle = this.tank.model.body.GetAngle()

        camera.matrix.save()

        Sprite.setMipMapLevel(0)

        this.drawSmoke(dt)

        const scale = this.size;
        const dscale = scale * 2;
        const segment = dscale / 4;

        let leftTrackDist = this.tank.model.behaviour.details.leftTrackDist
        let rightTrackDist = this.tank.model.behaviour.details.rightTrackDist
        let position = this.tank.model.body.GetPosition()

        camera.matrix.translate(position.x, position.y)
        camera.matrix.rotate(-angle)

        this.truckProgram.use()
        this.truckProgram.prepare()

        this.truckProgram.drawTruck(scale / 2, -scale * 0.8, segment, dscale, 4, leftTrackDist)
        this.truckProgram.drawTruck(-scale, -scale * 0.8, segment, dscale, 4, rightTrackDist)
        this.truckProgram.matrixUniform.setMatrix(camera.matrix.m)

        this.truckProgram.draw()

        this.bodyProgram.prepare()
        this.bodyProgram.use()

        this.bodyProgram.drawMaskedSprite(this.bodyBrightSprite, this.bodyDarkSprite, this.bodyLightMask,
            -scale * 0.9,
            -scale * 0.7,
            scale * 1.8,
            scale * 2
        )

        let normalizedAngle = (-angle / Math.PI / 2) % 1
        if(normalizedAngle < 0) normalizedAngle += 1

        this.bodyProgram.angleUniform.set1f(normalizedAngle)
        this.bodyProgram.matrixUniform.setMatrix(camera.matrix.m)
        this.bodyProgram.draw()
        camera.matrix.restore()
    }
}

class SniperTank extends ClientTank {
    constructor(model?) {
        super(model);

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
    static getModel() { return SniperTankModel }
    static getName() { return "Снайпер" }
    static getDescription() {
        return "Классический танк. Довольно быстрый и маневренный. " +
                "Его длинное дуло обеспечит точнейший выстрел. Отлично " +
                "подходит для всех ситуаций на поле битвы"
    }

    static getStats() {
        return {
            damage: 3,
            health: 10,
            speed: 90,
            shootrate: 1,
            reload: 5
        }
    }
}

ClientTank.register(SniperTank)
export default SniperTank;