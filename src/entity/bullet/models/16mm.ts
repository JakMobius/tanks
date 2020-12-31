
import BulletModel from '../bulletmodel';

class BulletModel16mm extends BulletModel {

    static typeName() { return 4 }

    constructor() {
        super();
    }
}

BulletModel.register(BulletModel16mm)

export default BulletModel16mm;