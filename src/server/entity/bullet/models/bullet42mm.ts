
import ServerBullet from '../serverbullet';
import BulletModel42mm from '../../../../entity/bullet/models/42mm';
import BulletModel from "../../../../entity/bullet/bulletmodel";

class ServerBullet42mm extends ServerBullet {

    static Model = BulletModel42mm

    constructor(model: BulletModel42mm) {
        super(model);

        this.wallDamage = 3000
        this.startVelocity = 450
        this.explodePower = 5
    }
}
export default ServerBullet42mm;