
import ServerBullet, {ServerBulletConfig} from '../server-bullet';
import BulletModelCannonball from '../../../../entity/bullets/models/cannonball-bullet-model';

export default class ServerBulletCannonball extends ServerBullet<BulletModelCannonball> {

    static Model = BulletModelCannonball

    constructor(options: ServerBulletConfig<BulletModelCannonball>) {
        super(options);

        this.startVelocity = 600
        this.explodePower = 0
        this.wallDamage = 7600
        this.mass = 30
    }
}