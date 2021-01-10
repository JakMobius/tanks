
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

export interface TankConfig {
    model?: TankModel
    world?: ClientGameWorld
}

class ClientTank extends AbstractTank {
	public engine: Engine;
	public serverPosition: Box2D.Vec2;
	public health: any;
	public Types: any;

    drawer: TankDrawer = null
    effects = new Map<number, ClientTankEffect>()
    world: ClientGameWorld

    constructor(options?: TankConfig) {
        super(options)
        this.drawer = null
        this.engine = null
        this.serverPosition = null
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
        if(this.serverPosition) {
            let pos = this.model.body.GetTransform().p
            let target = this.serverPosition

            let diffX = (target.x - pos.x)
            let diffY = (target.y - pos.y)

            if(diffX * diffX + diffY * diffY > 400) {
                pos.x = target.x
                pos.y = target.y
            } else {
                pos.x += (target.x - pos.x) / 20
                pos.y += (target.y - pos.y) / 20
            }
            this.model.body.SetPosition(pos)
        }
        for(let effect of this.effects.values()) {
            effect.tick(dt)
        }
        this.model.rotation = this.model.body.GetAngle()
        this.model.behaviour.tick(dt)
        this.model.behaviour.countDetails(dt)
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
        } else {
            if (this.serverPosition)
                this.serverPosition.Set(x, y)
            else this.serverPosition = new Box2D.Vec2(x, y)
        }
        this.model.body.GetTransform().SetPositionAngle(position, rotation)

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