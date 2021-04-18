
import AbstractTank from '../../tanks/abstracttank';
import * as Box2D from '../../library/box2d';
import ClientGameWorld from "../../../src/client/clientgameworld";
import TankModel from 'src/tanks/tankmodel';
import ClientTankEffect from '../effects/tank/clienttankeffect';
import TankDrawer from '../graphics/drawers/tankdrawer';
import {TankStat} from "./tank-stat";
import Engine from "../engine";
import BinaryDecoder from "../../serialization/binary/binarydecoder";
import BinaryEncoder from "../../serialization/binary/binaryencoder";
import {Vec2} from "../../library/box2d";

export interface TankConfig {
    model?: TankModel
    world?: ClientGameWorld
}

class ClientTank extends AbstractTank {
	public engine: Engine;
	public serverVelocity: Vec2 = new Vec2();
	public serverPosition: Vec2 = new Vec2();
	public serverPositionUpdateDate: number = 0
	public health: number;
	public Types: any;

    drawer: TankDrawer = null
    effects = new Map<number, ClientTankEffect>()
    world: ClientGameWorld

    constructor(options?: TankConfig) {
        super(options)
        this.drawer = null
        this.engine = null
    }

    setupModel(model: TankModel) {
        if(model) {
            let expected = (this.constructor as typeof ClientTank).getModel()
            if (expected && model.constructor !== expected) {
                throw new TypeError("Invalid model type")
            }
            this.model = model
        } else {
            const tankClass = (this.constructor as typeof ClientTank).getModel()
            this.model = new tankClass()
        }
    }

    setupDrawer(ctx: WebGLRenderingContext): void {
        let tankClass = (this.constructor as typeof ClientTank)
        this.drawer = new (tankClass.getDrawer())(this, ctx)
    }

    destroy(): void {
        this.model.destroy()
    }

    tick(dt: number) {
        if(this.serverPositionUpdateDate) {
            let pos = this.model.body.GetPosition()

            let targetX = this.serverPosition.x
            let targetY = this.serverPosition.y

            let timePassedSinceUpdate = (Date.now() - this.serverPositionUpdateDate) / 1000

            if(timePassedSinceUpdate < 0.1) {
                targetX += this.serverVelocity.x * timePassedSinceUpdate
                targetY += this.serverVelocity.y * timePassedSinceUpdate
            }

            let diffX = (targetX - pos.x)
            let diffY = (targetY - pos.y)

            let newX = 0;
            let newY = 0;

            if(diffX * diffX + diffY * diffY > 400) {
                newX = targetX
                newY = targetY
            } else {
                newX = pos.x + diffX / 20
                newY = pos.y + diffY / 20
            }

            this.model.body.SetPositionXY(newX, newY)
        }
        for(let effect of this.effects.values()) {
            effect.tick(dt)
        }
        this.model.rotation = this.model.body.GetAngle()
        this.model.behaviour.tick(dt)
    }

    decodeDynamicData(decoder: BinaryDecoder) {
        let teleport = decoder.readUint8()
        let x = decoder.readFloat32()
        let y = decoder.readFloat32()
        let rotation = decoder.readFloat32()
        let vx = decoder.readFloat32()
        let vy = decoder.readFloat32()
        let angularVelocity = decoder.readFloat32()

        let velocity = this.model.body.GetLinearVelocity()

        velocity.Set(vx, vy)

        this.model.body.SetLinearVelocity(velocity)
        this.model.body.SetAngularVelocity(angularVelocity)

        let position = this.model.body.GetPosition()

        // When teleporting, player should instantly move
        // from one point to another. Otherwise, this
        // meant to be continious movement. Considering
        // ping jitter and other imperfections of WWW,
        // these positions should be interpolated to give
        // a smooth move impression to player.

        if (teleport) {
            position.Set(x, y)
        }

        this.serverPosition.Set(x, y)
        this.serverVelocity.Set(vx, vy)
        this.serverPositionUpdateDate = Date.now()

        this.model.body.SetPosition(position)
        this.model.body.SetAngle(rotation)

        this.health = decoder.readFloat32()
    }

    encodeDynamicData(encoder: BinaryEncoder) {

    }

    static createDrawer() {}
    static getDrawer(): typeof TankDrawer { return null }
    static getName(): string { return null }
    static getDescription(): string { return null }
    static getStats(): TankStat { return null }

    static fromModel(model: TankModel): ClientTank {
        let clazz = ClientTank.Types.get((model.constructor as typeof TankModel).getId())

        return new clazz({
            model: model
        })
    }

    static register(clazz: typeof ClientTank): void {
        this.Types.set(clazz.getModel().getId(), clazz)
    }
}

export default ClientTank;