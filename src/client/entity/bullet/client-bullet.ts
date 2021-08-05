
import ClientEntity from '../client-entity';
import BulletModel from 'src/entity/bullets/bullet-model';
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import * as Box2D from "src/library/box2d"

export interface ClientBulletOptions<ModelType extends BulletModel> {
    model: ModelType
}

export default class ClientBullet<ModelType extends BulletModel> extends ClientEntity<ModelType> {
    private shooterId: number;

    constructor(options: ClientBulletOptions<ModelType>) {
        super(options.model);
    }

    getShooter() {
        return this.getWorld().players.get(this.shooterId)
    }

    shouldHitEntity(entity: ClientEntity): boolean {
        return entity != this.getShooter().tank;
    }

    onEntityHit(entity: ClientEntity) {
        this.hidden = true
    }

    onBlockHit(x: number, y: number, contactPoint: Box2D.Vec2) {
        this.hidden = true
    }

    decodeInitialData(decoder: BinaryDecoder) {
        super.decodeInitialData(decoder);
        this.shooterId = decoder.readUint32()
    }

    decodeDynamicData(decoder: BinaryDecoder) {
        super.decodeDynamicData(decoder);
        this.hidden = false
    }
}
