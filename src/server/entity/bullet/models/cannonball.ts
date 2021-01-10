
import ServerBullet from '../serverbullet';
import BulletModelCannonball from '../../../../entity/bullet/models/cannonball';
import BulletModel from "../../../../entity/bullet/bulletmodel";

class ServerBulletCannonball extends ServerBullet {

    static Model = BulletModelCannonball

    constructor(model: BulletModelCannonball) {
        super(model);

        this.startVelocity = 600
        this.explodePower = 0
        this.wallDamage = 7600
        this.mass = 30
    }
}

export default ServerBulletCannonball;