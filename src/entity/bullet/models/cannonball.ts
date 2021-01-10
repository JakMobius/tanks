import BulletModel from '../bulletmodel';
import {BinarySerializer} from "../../../serialization/binary/serializable";

class BulletModelCannonball extends BulletModel {
    static typeName = 2
}

BinarySerializer.register(BulletModelCannonball)

// module.exports = new BulletType({
// 	name: "cannonball",
// 	explodePower: 2,
// 	mass: 30,
// 	wallDamage: 7600,
// 	playerDamage: 4,
// 	velocity: 600,
// 	explodes: false,
// 	id: 2
// })

export default BulletModelCannonball;