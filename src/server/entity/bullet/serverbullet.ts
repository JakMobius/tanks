
import WorldExplodeEffectModel from '@/effects/world/explode/worldexplodeeffectmodel';
import ServerWorldEffect from '@/server/effects/world/serverworldeffect';
import ServerEntity from '../serverentity';
import GameMap from '../../../utils/map/gamemap';

class ServerBullet extends ServerEntity {
	public wallDamage: any;
	public playerDamage: any;
	public explodePower: any;
	public mass: any;
	public startVelocity: any;
    /** @type Player */
    shooter = null

    constructor(model) {
        super(model);

        this.wallDamage = 0
        this.playerDamage = 0
        this.explodePower = 0
        this.mass = 3
        this.startVelocity = 20
    }

    tick(dt) {
        let dx = this.model.dx * dt
        let dy = this.model.dy * dt

        if(dx !== 0 || dy !== 0) {
            let collision = this.checkWallHit(this.model.x, this.model.y, dx, dy)
            let world = this.shooter.world
 
            if (collision) {
                this.model.x = collision.point.x
                this.model.y = collision.point.y
                if(this.wallDamage) {
                    if(world.map.getBlock(collision.block.x, collision.block.y)) {
                        world.map.damageBlock(collision.block.x, collision.block.y, this.wallDamage)
                    }
                }
                this.die()
                return
            }

            let playerCollision = this.checkPlayerHit(this.model.x, this.model.y, dx, dy)

            if(playerCollision) {
                this.model.x += dx * playerCollision.distance
                this.model.y += dy * playerCollision.distance
                this.die()
                return
            }
        }

        super.tick(dt)
    }

    die() {
        if(this.model.dead) return
        this.model.dead = true
        if(this.explodePower) {
            let effect = new WorldExplodeEffectModel({
                x: this.model.x,
                y: this.model.y,
                power: this.explodePower
            })
            this.shooter.world.addEffect(ServerWorldEffect.fromModel(effect, this.shooter.world))
        }
    }
}

export default ServerBullet;