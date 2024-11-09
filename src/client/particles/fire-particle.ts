import Particle, {ParticleConfig} from './particle';

export default class FireParticle extends Particle {
	public scaling: number;
	public colors: number[][];
	public times: number[];

    createColors(config: ParticleConfig) {
        let varying = 0.11
        return [
            [1 - Math.random() * varying, 1 - Math.random() * varying, Math.random() * varying, 0],
            [1 - Math.random() * varying, 1 - Math.random() * varying, Math.random() * varying, 0.4],
            [1 - Math.random() * varying, 0.5 - Math.random() * varying, Math.random() * varying, 0.6],
            [1 - Math.random() * varying, 0.5 - Math.random() * varying, Math.random() * varying, 0]
        ]
    }

    createTimings(config: ParticleConfig) {
        return [
            0.0,
            0.1,
            0.6,
            1.0
        ]
    }

    constructor(config: ParticleConfig) {
        super(config)
        this.width = config.width || 4
        this.height = config.height || 4
        this.scaling = config.scaling || 0.01

        this.colors = this.createColors(config)
        this.times = this.createTimings(config)
        this.tick(0)
    }

    tick(dt: number) {
        super.tick(dt)
        if(this.dead) return
        let fraction = this.lifespan / this.lifetime
        let r, g, b, a, c1, c2
        let colors = this.colors

        for(let i = 0, l = colors.length; i < l; i++) {
            if(fraction < this.times[i]) {
                c2 = i
                break
            } else {
                c1 = i
            }
        }

        if(c2 === undefined) c2 = colors.length - 1
        let f1 = (fraction - this.times[c1]) / (this.times[c2] - this.times[c1])
        let f2 = 1 - f1

        c1 = colors[c1]
        c2 = colors[c2]

        r = c1[0] * f2 + c2[0] * f1
        g = c1[1] * f2 + c2[1] * f1
        b = c1[2] * f2 + c2[2] * f1
        a = c1[3] * f2 + c2[3] * f1

        this.color.setRGB(r, g, b, a)

        this.width += this.scaling * dt
        this.height += this.scaling * dt
    }
}