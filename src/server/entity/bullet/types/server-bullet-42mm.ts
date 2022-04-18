import ServerBullet, {ServerBulletConfig} from '../server-bullet';
import BulletModel42mm from '../../../../entity/bullets/models/42mm-bullet-model';

export default class ServerBullet42mm extends ServerBullet {

    static Model = BulletModel42mm

    constructor(options: ServerBulletConfig) {
        super(options);

        this.wallDamage = 3000
        this.startVelocity = 112.5
        this.explodePower = 5
    }
}