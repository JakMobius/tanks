
import Color from '../../utils/color';

class Particle {
	public x: any;
	public y: any;
	public dx: any;
	public dy: any;
	public dead: any;
	public lifetime: any;
	public lifespan: any;
	public damping: any;
	public color: any;
	public width: any;
	public height: any;

    constructor(config) {
        this.x = config.x
        this.y = config.y
        this.dx = config.dx
        this.dy = config.dy
        this.dead = false
        this.lifetime = config.lifetime || 0.4
        this.lifespan = config.lifespan || 0
        this.damping = config.damping || 0.99
        this.color = config.color || new Color(0, 0, 0)
        this.width = config.width || 0
        this.height = config.height || 0
    }

    tick(dt) {
        this.dx *= this.damping
        this.dy *= this.damping
        this.x += this.dx * dt
        this.y += this.dy * dt
        this.lifespan += dt

        if(this.lifespan > this.lifetime) {
            this.dead = true
        }
    }
}

export default Particle;