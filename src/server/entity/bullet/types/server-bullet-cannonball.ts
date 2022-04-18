import ServerBullet, {ServerBulletConfig} from '../server-bullet';
import BulletModelCannonball from '../../../../entity/bullets/models/cannonball-bullet-model';

export default class ServerBulletCannonball extends ServerBullet {

    static Model = BulletModelCannonball

    constructor(options: ServerBulletConfig) {
        super(options);

        this.startVelocity = 150
        this.explodePower = 0
        this.wallDamage = 7600
    }
}