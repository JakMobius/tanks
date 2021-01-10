import Map from '../../../utils/map/gamemap';
import BulletModel from '../bulletmodel';
import GameWorld from "../../../gameworld";
import GameMap from "../../../utils/map/gamemap";
import BlockState from "../../../utils/map/blockstate/blockstate";
import EntityModel from "../../entitymodel";

class BulletModelBomb extends BulletModel {
	constructor(game: GameWorld) {
		super(game)
		this.affectWalls = false
		this.lifetime = this.type.lifetime
	}

	private static isSolid(map: GameMap, x: number, y: number): boolean {
		let block = map.getBlock(Math.floor(x), Math.floor(y))
		if(!block) return false
		return (block.constructor as typeof BlockState).isSolid

	}

	private checkCollision(game: GameWorld) {

		const x = this.x / GameMap.BLOCK_SIZE;
		const y = this.y / GameMap.BLOCK_SIZE;
		const d = this.type.size / GameMap.BLOCK_SIZE;

		if(BulletModelBomb.isSolid(game.map, Math.floor(x + d), Math.floor(y - d))) return true
		if(BulletModelBomb.isSolid(game.map, Math.floor(x + d), Math.floor(y + d))) return true
		if(BulletModelBomb.isSolid(game.map, Math.floor(x - d), Math.floor(y - d))) return true
		if(BulletModelBomb.isSolid(game.map, Math.floor(x - d), Math.floor(y + d))) return true

		return false
	}

	tick(dt: number) {

		const steps = 10;
		const game = this.game

		let dx = this.speed.x * dt / steps;
		let dy = this.speed.y * dt / steps;

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

		this.speed.x = dx * steps / dt
		this.speed.y = dy * steps / dt

		super.tick(dt)

		const speed = Math.sqrt(this.speed.x ** 2 + this.speed.y ** 2), k = (speed - this.type.friction * dt) / speed;

		this.speed.x *= k
		this.speed.y *= k

		  this.x -= this.speed.x * dt
		  this.y -= this.speed.y * dt

		  this.lifetime -= dt

		  if(this.lifetime < 0) {
			// датвидания
			// this.dead = true
			game.removeEntity(this.entity)

			if (this.type.explodePower > 0) {
				game.explosionEffectPool.start(this.x, this.y, this.type.explodePower)
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

export default BulletModelBomb;