
import Color from '../../utils/color';

export interface ParticleConfig {
    x: number
    y: number
    dx?: number
    dy?: number
    lifetime?: number
    lifespan?: number
    damping?: number
    color?: Color
    width?: number
    height?: number
    scaling?: number
}

export default class Particle {
	public x: number;
	public y: number;
	public dx: number;
	public dy: number;
	public dead: boolean;
	public lifetime: number;
	public lifespan: number;
	public damping: number;
	public color: Color;
	public width: number;
	public height: number;
	public scaling: number;

    constructor(config: ParticleConfig) {
        this.x = config.x
        this.y = config.y
        this.dx = config.dx || 0
        this.dy = config.dy || 0
        this.dead = false
        this.lifetime = config.lifetime || 0.4
        this.lifespan = config.lifespan || 0
        this.damping = config.damping || 1
        this.color = config.color || new Color(0, 0, 0)
        this.width = config.width || 0
        this.height = config.height || 0
        this.scaling = config.scaling || 0
    }

    tick(dt: number) {
        let coefficient = 1.0 / (1.0 + dt * this.damping)
        this.dx *= coefficient
        this.dy *= coefficient
        this.x += this.dx * dt
        this.y += this.dy * dt
        this.lifespan += dt

        this.width += this.scaling * dt
        this.height += this.scaling * dt

        if(this.lifespan > this.lifetime) {
            this.dead = true
        }
    }
}