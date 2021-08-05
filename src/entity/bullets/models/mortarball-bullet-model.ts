import BulletModel from '../bullet-model';

// class MortarBallType extends BulletType {
// 	constructor(config) {
// 		super(config);
// 	}
//
// 	create() {
// 		return new MortarBall(this)
// 	}
// }
//
// class MortarBall extends Bullet {
// 	constructor() {
// 		super()
// 		this.speed.z = this.type.verticalVelocity
// 		this.z = 0
// 	}
//
// 	tick(screen) {
// 		this.x += this.speed.x / screen.tps
// 		  this.y += this.speed.y / screen.tps
// 		  this.z += this.speed.z / screen.tps
//
// 		  this.speed.z -= this.type.gravity / screen.tps
//
// 		  if(this.speed.z < 0 && this.z <= 0) {
// 			this.dead = true
//
// 			screen.removeEntity(this)
//
// 			if (this.type.explodePower > 0) {
// 				screen.createExplosion(this.x, this.y, this.type.explodePower, this.shooter)
// 			}
// 		  }
//
// 		  this.diesAfterWallHit = this.z < 1
// 	}
// }
//
// module.exports = new MortarBallType({
// 	name: "mortarball",
// 	explodePower: 16,
// 	mass: 30,
// 	wallDamage: 7600,
// 	playerDamage: 4,
// 	velocity: 110,
// 	verticalVelocity: 6,
// 	gravity: 9.8,
// 	explodes: false,
// 	id: 5
// })

export default class BulletModelMortarBall extends BulletModel {

}