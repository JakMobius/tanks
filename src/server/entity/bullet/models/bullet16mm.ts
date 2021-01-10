
import ServerBullet from '../serverbullet';
import BulletModel16mm from '../../../../entity/bullet/models/16mm';
import EntityModel from "../../../../entity/entitymodel";
import BulletModel from "../../../../entity/bullet/bulletmodel";

class ServerBullet16mm extends ServerBullet {

    static Model = BulletModel16mm

    constructor(model: BulletModel16mm) {
        super(model);

        this.startVelocity = 600
        this.explodePower = 0
        this.wallDamage = 1000
        this.playerDamage = 0.5
        this.mass = 1
    }
}

export default ServerBullet16mm;