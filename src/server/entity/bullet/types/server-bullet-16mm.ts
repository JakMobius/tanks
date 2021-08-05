
import ServerBullet, {ServerBulletConfig} from '../server-bullet';
import BulletModel16mm from '../../../../entity/bullets/models/16mm-bullet-model';

export default class ServerBullet16mm extends ServerBullet<BulletModel16mm> {

    static Model = BulletModel16mm

    constructor(options: ServerBulletConfig<BulletModel16mm>) {
        super(options);

        this.startVelocity = 600
        this.explodePower = 0
        this.wallDamage = 1000
        this.playerDamage = 0.5
        this.mass = 1
    }
}