
import ClientTank, {TankConfig} from '../clienttank';
import TankDrawer from 'src/client/graphics/drawers/tankdrawer';
import MonsterTankModel from 'src/tanks/models/monster';
import Engine from 'src/client/engine';
import FX from 'src/client/sound/fx';
import Sprite from 'src/client/sprite';
import LightMaskTextureProgram from 'src/client/graphics/programs/lightmasktextureprogram';
import TextureProgram from 'src/client/graphics/programs/textureprogram';
import Matrix3 from 'src/client/graphics/matrix3';
import {TankStat} from "../tank-stat";
import TankModel from 'src/tanks/tankmodel';
import Camera from "../../camera";
import BigBoiTankModel from "../../../tanks/models/bigboi";

class Drawer extends TankDrawer {
	public size: number;
	public bodyBrightSprite: Sprite;
	public bodyDarkSprite: Sprite;
	public bodyLightMask: Sprite;
	public wheelSpriteCount: number;
	public wheelSprites: Sprite[];
	public spriteMatrix: Matrix3;
	public bodyProgram: LightMaskTextureProgram;
	public wheelProgram: TextureProgram;
	public tank: MonsterTank;

    constructor(tank: MonsterTank, ctx: WebGLRenderingContext) {
        super(tank, ctx);

        this.tank = tank

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

    draw(camera: Camera, dt: number) {

        let angle = this.tank.model.body.GetAngle()

        camera.matrix.save()

        this.drawSmoke(dt)

        const scale = this.size;

        let position = this.tank.model.body.GetPosition()

        camera.matrix.translate(position.x, position.y)
        camera.matrix.rotate(-angle)

        this.wheelProgram.use()
        this.wheelProgram.prepare()

        for(let wheel of this.tank.model.behaviour.wheels) {

            let spriteIndex = Math.floor(-wheel.distance * 8 % this.wheelSpriteCount);

            if(spriteIndex < 0) spriteIndex = this.wheelSpriteCount + spriteIndex;

            this.drawWheel(spriteIndex, wheel.position.x, -wheel.position.y, wheel.angle)
        }

        this.wheelProgram.matrixUniform.setMatrix(camera.matrix.m)
        this.wheelProgram.draw()

        this.bodyProgram.prepare()
        this.bodyProgram.use()

        this.bodyProgram.drawMaskedSprite(this.bodyBrightSprite, this.bodyDarkSprite, this.bodyLightMask,
            -scale * 0.8, -scale, scale * 1.6, scale * 2
        )

        this.bodyProgram.setLightAngle(-angle)
        this.bodyProgram.matrixUniform.setMatrix(camera.matrix.m)
        this.bodyProgram.draw()

        camera.matrix.restore()
    }

    private drawWheel(sprite: number, x: number, y: number, angle: number): void {
        let scale = this.size
        this.spriteMatrix.save()
        this.spriteMatrix.translate(x, y)
        if(angle) this.spriteMatrix.rotate(angle)
        this.wheelProgram.drawSprite(this.wheelSprites[sprite], -scale * 0.18, -scale * 0.3, scale * 0.36, scale * 0.6)
        this.spriteMatrix.restore()
    }
}

export interface MonsterTankConfig extends TankConfig {
    model?: BigBoiTankModel
}

class MonsterTank extends ClientTank {

    public model: MonsterTankModel

    constructor(options?: MonsterTankConfig) {
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

        this.setupModel(options.model)
    }

    static getDrawer(): typeof TankDrawer { return Drawer }
    static getModel(): typeof TankModel { return MonsterTankModel }
    static getName(): string { return "Монстр" }
    static getDescription(): string {
        return "Рассекайте шоссе 66 на монстре! Скоростной пулемёт " +
            "поможет сбить прицел соперника, а мощный двигатель и " +
            "хорошая маневренность позволят оторваться почти от " +
            "любых видов военной техники."
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

export default MonsterTank;