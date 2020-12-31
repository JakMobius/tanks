
import ServerBullet from '../serverbullet';
import BulletModel16mm from '../../../../entity/bullet/models/16mm';

class ServerBullet16mm extends ServerBullet {
    constructor(model) {
        super(model);

        this.startVelocity = 600
        this.explodePower = 0
        this.wallDamage = 1000
        this.playerDamage = 0.5
        this.mass = 1
    }
}

ServerBullet.associate(ServerBullet16mm, BulletModel16mm);
export default ServerBullet16mm;