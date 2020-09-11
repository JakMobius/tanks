
const ClientTank = require("../clienttank")
const TankDrawer = require("/src/client/graphics/drawers/tankdrawer")
const MonsterTankModel = require("/src/tanks/models/monster")
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
        this.bodyBrightSprite = Sprite.named("tanks/monster/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/monster/body-dark")
        this.bodyLightMask = Sprite.named("tanks/monster/mask")

        this.wheelSpriteCount = 10
        this.wheelSprites = []
        this.spriteMatrix = new Matrix3()

        for(let i = 1; i <= this.wheelSpriteCount; i++) {
            this.wheelSprites.push(Sprite.named("tanks/monster/wheel_" + i))
        }

        this.bodyProgram = new LightMaskTextureProgram("tank-body-drawer", ctx)
        this.wheelProgram = new TextureProgram("tank-wheel-drawer", ctx)

        this.wheelProgram.setTransform(this.spriteMatrix)
    }

    draw(camera, dt) {

        let angle = this.tank.model.body.GetAngle()

        camera.matrix.save()

        this.drawSmoke(dt)

        const scale = this.size;

        let leftWheelsDist = this.tank.model.behaviour.details.leftWheelsDist
        let rightWheelsDist = this.tank.model.behaviour.details.rightWheelsDist
        let leftWheelsAngle = this.tank.model.behaviour.details.leftWheelsAngle
        let rightWheelsAngle = this.tank.model.behaviour.details.rightWheelsAngle

        let position = this.tank.model.body.GetPosition()

        camera.matrix.translate(position.x, position.y)
        camera.matrix.rotate(-angle)

        let l = Math.floor(leftWheelsDist % this.wheelSpriteCount);
        let r = Math.floor(rightWheelsDist % this.wheelSpriteCount);

        if(l < 0) l = this.wheelSpriteCount + l;
        if(r < 0) r = this.wheelSpriteCount + r;

        this.wheelProgram.use()
        this.wheelProgram.prepare()

        this.drawWheel(l, 0.82, -0.85, leftWheelsAngle)
        this.drawWheel(l, 0.82, -0.18, 0)
        this.drawWheel(l, 0.82, 0.48, -leftWheelsAngle)
        this.drawWheel(r, -0.82, -0.85, rightWheelsAngle)
        this.drawWheel(r, -0.82, -0.18, 0)
        this.drawWheel(r, -0.82, 0.48, -rightWheelsAngle)

        this.wheelProgram.matrixUniform.setMatrix(camera.matrix.m)
        this.wheelProgram.draw()

        this.bodyProgram.prepare()
        this.bodyProgram.use()

        this.bodyProgram.drawMaskedSprite(this.bodyBrightSprite, this.bodyDarkSprite, this.bodyLightMask,
            -scale * 0.8, -scale * 1.15, scale * 1.6, scale * 2
        )

        this.bodyProgram.setLightAngle(-angle)
        this.bodyProgram.matrixUniform.setMatrix(camera.matrix.m)
        this.bodyProgram.draw()

        camera.matrix.restore()
    }

    drawWheel(sprite, x, y, angle) {
        let scale = this.size
        this.spriteMatrix.save()
        this.spriteMatrix.translate(scale * x, scale * y)
        if(angle) this.spriteMatrix.rotate(angle)
        this.wheelProgram.drawSprite(this.wheelSprites[sprite], -scale * 0.18, -scale * 0.3, scale * 0.36, scale * 0.6)
        this.spriteMatrix.restore()
    }
}

class MonsterTank extends ClientTank {
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
    static getModel() { return MonsterTankModel }
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

ClientTank.register(MonsterTank)
module.exports = MonsterTank