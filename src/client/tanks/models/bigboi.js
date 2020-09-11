
const ClientTank = require("../clienttank")
const TankDrawer = require("../../graphics/drawers/tankdrawer")
const BigBoiTankModel = require("../../../tanks/models/bigboi")
const Engine = require("../../engine")
const FX = require("../../sound/fx")
const Sprite = require("../../sprite")
const LightMaskTextureProgram = require("../../graphics/programs/lightmasktextureprogram")
const TruckProgram = require("../../graphics/programs/truckprogram")

class Drawer extends TankDrawer {

    constructor(tank, ctx) {
        super(tank, ctx);

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

    draw(camera, dt) {

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

class BigboiTank extends ClientTank {
    constructor(model) {
        super(model);

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
    static getModel() { return BigBoiTankModel }
    static getName() { return "Big Boi" }
    static getDescription() {
        return "Это невероятное чудо техники создано, чтобы " +
            "уничтожать всё на своём пути. Снаряд этого танка, " +
            "имея огромную массу, способен резко изменить " +
            "траекторию движения соперника или вовсе закрутить и обездвижить его."
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

ClientTank.register(BigboiTank)
module.exports = BigboiTank