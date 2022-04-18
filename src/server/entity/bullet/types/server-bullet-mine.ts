import ServerBullet, {ServerBulletConfig} from '../server-bullet';
import BulletModelMine from '../../../../entity/bullets/models/mine-bullet-model';

export default class ServerBulletMine extends ServerBullet<BulletModelMine> {

    static Model = BulletModelMine

    constructor(options: ServerBulletConfig<BulletModelMine>) {
        super(options);

        this.startVelocity = 0
        this.explodePower = 15
    }

    tick(dt: number) {

    }
}