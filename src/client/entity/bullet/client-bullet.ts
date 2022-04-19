import ClientEntity from '../client-entity';
import BulletModel from 'src/entity/bullets/bullet-model';
import * as Box2D from "src/library/box2d"
import ReadBuffer from "../../../serialization/binary/read-buffer";

export interface ClientBulletOptions {
    model: BulletModel
}

export default class ClientBullet extends ClientEntity {
    private shooterId: number;

    constructor(options: ClientBulletOptions) {
        super(options.model);
    }

    // TODO: fix it

    // getShooter() {
    //     return this.model.parent.players.get(this.shooterId)
    // }

    // shouldHitEntity(entity: ClientEntity): boolean {
    //     return entity != this.getShooter().tank;
    // }

    // onEntityHit(entity: ClientEntity) {
    //     this.hidden = true
    // }
    //
    // onBlockHit(x: number, y: number, contactPoint: Box2D.Vec2) {
    //     this.hidden = true
    // }

    // decodeInitialData(decoder: ReadBuffer) {
    //     super.decodeInitialData(decoder);
    //     this.shooterId = decoder.readUint32()
    // }
    //
    // decodeDynamicData(decoder: ReadBuffer) {
    //     super.decodeDynamicData(decoder);
    //     this.hidden = false
    // }
}
