const Map = require("../../../utils/map/gamemap");
const BulletModel = require("../bulletmodel")

class BulletModelBomb extends BulletModel {
	constructor(type) {
		super(type)
		this.affectWalls = false
		this.lifetime = this.type.lifetime
	}

	checkCollision(game) {

		const x = this.x / 20;
		const y = this.y / 20;
		const d = this.type.size / 20;

		// noinspection JSBitwiseOperatorUsage
		if(game.map.getBlock(Math.floor(x + d), Math.floor(y - d)) & Map.SolidMask) return true
		// noinspection JSBitwiseOperatorUsage
		if(game.map.getBlock(Math.floor(x + d), Math.floor(y + d)) & Map.SolidMask) return true
		// noinspection JSBitwiseOperatorUsage
		if(game.map.getBlock(Math.floor(x - d), Math.floor(y - d)) & Map.SolidMask) return true

		return !!(game.map.getBlock(Math.floor(x - d), Math.floor(y + d)) & Map.SolidMask);

	}

	tick(game) {

		const steps = 10;

		let dx = this.speed.x / game.tps / steps;
		let dy = this.speed.y / game.tps / steps;

		for(let i = 0; i < steps; i++) {
			this.x += dx

			if(this.checkCollision(game)) {
				this.x -= dx
				dx = -dx
			}

			  this.y += dy

			  if(this.checkCollision(game)) {
				this.y -= dy
				dy = -dy
			}
		}

		this.speed.x = dx * steps * game.tps
		this.speed.y = dy * steps * game.tps

		super.tick(game)

		const speed = Math.sqrt(this.speed.x ** 2 + this.speed.y ** 2), k = (speed - this.type.friction / game.tps) / speed;

		this.speed.x *= k
		this.speed.y *= k

		  this.x -= this.speed.x / game.tps
		  this.y -= this.speed.y / game.tps

		  this.lifetime -= game.spt

		  if(this.lifetime < 0) {
			  // датвидания

			  this.dead = true
			game.removeEntity(this)

			if (this.type.explodePower > 0) {
				game.createExplosion(this.x, this.y, this.type.explodePower, this.shooter)
			}
		  }
	}
}

// module.exports = new BombType({
// 	name: "bomb",
// 	explodePower: 14,
// 	mass: 30,
// 	playerDamage: 0,
// 	velocity: 160,
// 	explodes: false,
// 	size: 2,
// 	lifetime: 3,
// 	friction: 20,
// 	id: 1


// })

module.exports = BulletModelBomb