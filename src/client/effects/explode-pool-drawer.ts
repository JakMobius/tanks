import Camera from "../camera";
import ExplodeEffectPool from "../../effects/world/explode/explode-effect-pool";
import Screen from "../graphics/screen";
import ExplodeParticle from "../particles/explode-particle";
import ClientGameWorld from "../client-game-world";
import PostProcessingProgram from "../graphics/programs/post-processing-program";
import ParticleHost from "../particle-host";

export default class ExplodePoolDrawer {
	public screen: Screen;
	public camera: Camera;
	public program: PostProcessingProgram;

    constructor(camera: Camera, screen: Screen) {
        this.screen = screen
        this.camera = camera

        this.program = new PostProcessingProgram(this.screen.ctx)
    }

    draw(pool: ExplodeEffectPool, dt: number) {
        if(dt === 0) return

        //this.program.use()
        //this.program.bindBuffers()

        //this.screen.ctx.activeTexture(this.screen.ctx.TEXTURE15)
        //this.screen.ctx.bindTexture(this.screen.ctx.TEXTURE_2D, this.screen.inactiveFramebufferTexture())

        //this.program.textureUniform.set1i(15)

        let particleComponent = pool.entity.getComponent(ParticleHost)

        for(let row of pool.walkers.rows.values()) {
            for(let walker of row.values()) {
                let normalized = pool.normalize(walker.power)
                //
                // let decoration = new Particle({
                //     width: 20,
                //     height: 20,
                //     x: walker.x,
                //     y: walker.y,
                //     dx: 0,
                //     dy: 0,
                //     color: new Color(255, 0, 0, pool.normalize(walker.enginePower)),
                //     scaling: 0,
                //     lifetime: dt
                // })
                //
                // pool.world.particles.push(decoration)
                // continue

                if(normalized < 0.3) continue

                let dx = 0
                let dy = 0

                for (let i = 0; i < 3; i++) {

                    let decoration = new ExplodeParticle({
                        width: 0.5 + normalized * 2,
                        height: 0.5 + normalized * 2,
                        x: walker.x + (Math.random() - 0.5) * pool.gridSize * 2,
                        y: walker.y + (Math.random() - 0.5) * pool.gridSize * 2,
                        dx: dx,
                        dy: dy,
                        scaling: 0.25 + normalized / 8,
                        lifetime: 0.6 - normalized / 2 + Math.random() * 0.3,
                        startOpacity: normalized / 2,
                        shifting: 1 - normalized * 2
                    });

                    particleComponent.addParticle(decoration)
                }
            }
        }

        //this.program.draw()
    }
}