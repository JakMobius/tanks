
import AbstractEntity from '../../entity/abstract-entity';
import EntityDrawer from '../graphics/drawers/entity-drawer';
import EntityModel from '../../entity/entity-model';
import BinaryDecoder from "../../serialization/binary/binary-decoder";
import {Vec2} from "../../library/box2d";
import BinaryEncoder from "../../serialization/binary/binary-encoder";
import ClientGameWorld from "../client-game-world";
import {Constructor} from "../../serialization/binary/serializable";
import BulletModel from "../../entity/bullets/bullet-model";
import PhysicalComponent from "../../entity/physics-component";

export default class ClientEntity<ModelClass extends EntityModel = EntityModel> extends AbstractEntity<ClientGameWorld, ModelClass> {

	static types = new Map<Constructor<EntityModel>, Constructor<ClientEntity>>()

    public serverVelocity: Vec2 = new Vec2();
    public serverPosition: Vec2 = new Vec2();
    public serverPositionUpdateDate: number = 0
    public hidden: boolean;

    constructor(model: ModelClass) {
        super(model);
    }

    decodeDynamicData(decoder: BinaryDecoder) {
        let teleport = decoder.readUint8()
        let x = decoder.readFloat32()
        let y = decoder.readFloat32()
        let rotation = decoder.readFloat32()
        let vx = decoder.readFloat32()
        let vy = decoder.readFloat32()
        let angularVelocity = decoder.readFloat32()

        const body = this.model.getComponent(PhysicalComponent).getBody()

        let velocity = body.GetLinearVelocity()

        velocity.Set(vx, vy)

        body.SetLinearVelocity(velocity)
        body.SetAngularVelocity(angularVelocity)

        // When teleporting, entity should instantly move
        // from one point to another. Otherwise, this
        // meant to be continuous movement. Considering
        // ping jitter and other imperfections of WWW,
        // these positions should be interpolated to give
        // a smooth move impression to player.

        if (teleport) {
            body.SetPositionXY(x, y)
        }

        this.serverPosition.Set(x, y)
        this.serverVelocity.Set(vx, vy)
        this.serverPositionUpdateDate = Date.now()

        body.SetAngle(rotation)
    }

    decodeInitialData(decoder: BinaryDecoder) {
        const x = decoder.readFloat32()
        const y = decoder.readFloat32()
        const rotation = decoder.readFloat32()
        const vx = decoder.readFloat32()
        const vy = decoder.readFloat32()
        const angularVelocity = decoder.readFloat32()

        const body = this.model.getComponent(PhysicalComponent).getBody()

        body.SetPositionXY(x, y)

        let velocity = body.GetLinearVelocity()

        velocity.Set(vx, vy)

        body.SetLinearVelocity(velocity)
        body.SetAngularVelocity(angularVelocity)
        body.SetAngle(rotation)

        this.model.setHealth(decoder.readFloat32())
    }

    encodeInitialData(encoder: BinaryEncoder) {
        throw new Error("Method not implemented")
    }

    encodeDynamicData(encoder: BinaryEncoder): void {
        throw new Error("Method not implemented")
    }

    tick(dt: number) {
        super.tick(dt)
        if(this.serverPositionUpdateDate) {
            const body = this.model.getComponent(PhysicalComponent).getBody()
            let pos = body.GetPosition()

            let targetX = this.serverPosition.x
            let targetY = this.serverPosition.y

            let timePassedSinceUpdate = (Date.now() - this.serverPositionUpdateDate) / 1000

            if(timePassedSinceUpdate < 0.1) {
                targetX += this.serverVelocity.x * timePassedSinceUpdate
                targetY += this.serverVelocity.y * timePassedSinceUpdate
            }

            let diffX = (targetX - pos.x)
            let diffY = (targetY - pos.y)

            if(diffX * diffX + diffY * diffY > 400) {
                body.SetPositionXY(targetX, targetY)
                //console.log("bodies[id[" + this.model.id + "]].SetPositionXY(" + targetX + ", " + targetY + ")")
            } else {
                body.SetPositionXY(pos.x + diffX / 20, pos.y + diffY / 20)
                //console.log("bodies[id[" + this.model.id + "]].SetPositionXY(" + pos.x + ", " + pos.y + ")")
            }
        }
    }

    static getDrawer(): Constructor<EntityDrawer> {
        throw new Error("Method not implemented")
    }

    /**
     * Associates client wrapper class with the bullet model
     * @param clientClass Client class to associate with bullet model
     * @param modelClass Bullet model
     */

    static associate(clientClass: Constructor<ClientEntity>, modelClass: Constructor<EntityModel>) {
        this.types.set(modelClass, clientClass)
    }

    static fromModel(model: EntityModel) {
        let type = this.types.get(model.constructor as typeof EntityModel)

        if(type) {
            return new type({
                model: model
            })
        }
        return null
    }

    damage(damage: number): void {
        // Client entity should not handle this
    }
}