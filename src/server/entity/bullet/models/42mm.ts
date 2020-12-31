
import ServerBullet from '../serverbullet';
import BulletModel42mm from '../../../../entity/bullet/models/42mm';

class ServerBullet42mm extends ServerBullet {
    constructor(model) {
        super(model);

        this.wallDamage = 3000
        this.startVelocity = 450
        this.explodePower = 5
    }
}

ServerBullet.associate(ServerBullet42mm, BulletModel42mm);
export default ServerBullet42mm;