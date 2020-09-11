

const ClientTank = require("../clienttank")
const TankDrawer = require("/src/client/graphics/drawers/tankdrawer")
const NastyTankModel = require("/src/tanks/models/nasty")
const Engine = require("/src/client/engine")
const FX = require("/src/client/sound/fx")
const Sprite = require("/src/client/sprite")
const LightMaskTextureProgram = require("/src/client/graphics/programs/lightmasktextureprogram")
const TextureProgram = require("/src/client/graphics/programs/textureprogram")
const Matrix3 = require("/src/client/graphics/matrix3")

class Drawer extends TankDrawer {

    constructor(tank, ctx) {
        super(tank, ctx);

        this.size = 9
        this.bodyBrightSprite = Sprite.named("tanks/nasty/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/nasty/body-dark")
        this.bodyLightMask = Sprite.named("tanks/nasty/mask")

        this.ruderSprite = Sprite.named("tanks/nasty/ruder")
        this.bodyProgram = new LightMaskTextureProgram("tank-body-drawer", ctx)
        this.textureProgram = new TextureProgram("tank-texture-drawer", ctx)
        this.propellerSprites = []
        this.spriteMatrix = new Matrix3()

        this.spriteMatrix.translate(0, -this.size * 1.22)
        this.ruderAngle = Math.PI / 4

        for(let i = 1; i <= 4; i++)
            this.propellerSprites.push(Sprite.named("tanks/nasty/propeller_" + i))
    }

    draw(camera, dt) {

        let angle = this.tank.model.body.GetAngle()

        camera.matrix.save()

        this.drawSmoke(dt)

        const scale = this.size;

        let position = this.tank.model.body.GetPosition()

        camera.matrix.translate(position.x, position.y)
        camera.matrix.rotate(-angle)

        let propellerDist = this.tank.model.behaviour.details.propellerDist
        let ruderAngle = this.tank.model.controls.getSteer() * this.ruderAngle

        const propeller = this.propellerSprites[Math.round(propellerDist) % 4]

        this.bodyProgram.use()
        this.bodyProgram.prepare()

        this.bodyProgram.drawMaskedSprite(this.bodyBrightSprite, this.bodyDarkSprite, this.bodyLightMask, -scale * 0.96, -scale * 1.32, scale * 1.92, scale * 2.64)

        this.bodyProgram.matrixUniform.setMatrix(camera.matrix.m)
        this.bodyProgram.setLightAngle(-angle)
        this.bodyProgram.draw()

        this.textureProgram.use()
        this.textureProgram.prepare()
        this.textureProgram.drawSprite(propeller, -scale * 0.76, -scale * 1.06, scale * 0.6, scale * 0.08)
        this.textureProgram.drawSprite(propeller, scale * 0.17, -scale * 1.06, scale * 0.6, scale * 0.08)
        this.textureProgram.setTransform(this.spriteMatrix)


        this.spriteMatrix.save()
        this.spriteMatrix.translate(-scale * 0.46, 0)

        let ruderSine = Math.sin(ruderAngle)
        let ruderCos = Math.cos(ruderAngle)

        this.spriteMatrix.turn(ruderSine, ruderCos)

        this.textureProgram.drawSprite(this.ruderSprite, -scale * 0.06, -scale * 0.44, scale * 0.12, scale * 0.5)

        this.spriteMatrix.restore()
        this.spriteMatrix.save()
        this.spriteMatrix.translate(scale * 0.46, 0)
        this.spriteMatrix.turn(ruderSine, ruderCos)

        this.textureProgram.drawSprite(this.ruderSprite, -scale * 0.06, -scale * 0.44, scale * 0.12, scale * 0.5)

        this.spriteMatrix.restore()

        this.textureProgram.setTransform(null)
        this.textureProgram.matrixUniform.setMatrix(camera.matrix.m)
        this.textureProgram.draw()

        camera.matrix.restore()
    }
}

class NastyTank extends ClientTank {
    constructor(model) {
        super(model);

        this.engine = new Engine({
            sound: FX.ENGINE_4,
            multiplier: 20,
            pitch: 0.9,
            volume: 0.6
        })
    }

    static getDrawer() { return Drawer }
    static getModel() { return NastyTankModel }
    static getName() { return "Мерзила" }
    static getDescription() {
        return "Любите запах напалма на утрам? Тогда эта машина - " +
            "идеальный выбор для вас! Сложный в управлении, но чудовищно " +
            "разрушительный танк с огнемётом на воздушной подушке."
    }

    static getStats() {
        return {
            damage: 4,
            health: 15,
            speed: 110,
            shootrate: undefined,
            reload: undefined
        }
    }
}

ClientTank.register(NastyTank)
module.exports = NastyTank