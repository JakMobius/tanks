
import ServerBullet from '../serverbullet';
import BulletModelCannonball from '../../../../entity/bullet/models/cannonball';

class ServerBulletCannonball extends ServerBullet {
    constructor(model) {
        super(model);

        this.startVelocity = 600
        this.explodePower = 0
        this.wallDamage = 7600
        this.mass = 30
    }
}

ServerBullet.associate(ServerBulletCannonball, BulletModelCannonball);
export default ServerBulletCannonball;