

import ClientTank, {TankConfig} from '../clienttank';
import TankDrawer from 'src/client/graphics/drawers/tankdrawer';
import NastyTankModel from 'src/tanks/models/nasty';
import Engine from 'src/client/engine';
import FX from 'src/client/sound/fx';
import Sprite from 'src/client/sprite';
import LightMaskTextureProgram from 'src/client/graphics/programs/lightmasktextureprogram';
import TextureProgram from 'src/client/graphics/programs/textureprogram';
import Matrix3 from 'src/client/graphics/matrix3';
import Camera from "../../camera";
import TankModel from "../../../tanks/tankmodel";
import {TankStat} from "../tank-stat";
import BigBoiTankModel from "../../../tanks/models/bigboi";

class Drawer extends TankDrawer {
	public size: number = 9;
	public bodyBrightSprite: Sprite;
	public bodyDarkSprite: Sprite;
	public bodyLightMask: Sprite;
	public ruderSprite: Sprite;
	public bodyProgram: LightMaskTextureProgram;
	public textureProgram: TextureProgram;
	public propellerSprites: Sprite[];
	public spriteMatrix: Matrix3;
	public ruderAngle: number;
	public tank: NastyTank;

    constructor(tank: NastyTank, ctx: WebGLRenderingContext) {
        super(tank, ctx);

        this.tank = tank

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

    draw(camera: Camera, dt: number) {

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

export interface NastyTankConfig extends TankConfig {
    model?: NastyTankModel
}

class NastyTank extends ClientTank {

    public model: NastyTankModel

    constructor(options: NastyTankConfig) {
        options = options || {}
        super(options);

        this.engine = new Engine({
            sound: FX.ENGINE_4,
            multiplier: 20,
            pitch: 0.9,
            volume: 0.6
        })

        this.setupModel(options.model)
    }

    static getDrawer(): typeof TankDrawer { return Drawer }
    static getModel(): typeof TankModel { return NastyTankModel }
    static getName(): string { return "Мерзила" }
    static getDescription(): string {
        return "Любите запах напалма на утрам? Тогда эта машина - " +
            "идеальный выбор для вас! Сложный в управлении, но чудовищно " +
            "разрушительный танк с огнемётом на воздушной подушке."
    }

    static getStats(): TankStat {
        return {
            damage: 4,
            health: 15,
            speed: 110,
            shootrate: undefined,
            reload: undefined
        }
    }
}

export default NastyTank;