
import TextureProgram from '../../graphics/programs/textureprogram';
import Camera from "../../camera";
import ParticleProgram from "../programs/particleprogram";
import Screen from '../screen'
import ClientTank from "../../tanks/clienttank";
import ClientGameWorld from "../../clientgameworld";
import ExplodePoolDrawer from "../../effects/explodepooldrawer";
import MapDrawer from "./map-drawer";

class WorldDrawer {
	public camera: Camera
	public screen: Screen
    public particleProgram: ParticleProgram
    public entityProgram: TextureProgram
    public explodePoolDrawer: ExplodePoolDrawer
    private world: ClientGameWorld;
	private mapDrawer: MapDrawer
	private mapChangeHandler: () => void

    constructor(camera: Camera, screen: Screen, world: ClientGameWorld) {
        this.camera = camera
        this.screen = screen

        this.particleProgram = new ParticleProgram("particle-drawer-blockProgram", this.screen.ctx)
        this.entityProgram = new TextureProgram("entity-drawer", this.screen.ctx)
        this.explodePoolDrawer = new ExplodePoolDrawer(this.camera, this.screen)
        this.mapDrawer = new MapDrawer(this.screen)

        this.mapChangeHandler = () => this.mapDrawer.reset()
        this.setWorld(world)
    }

    setWorld(world: ClientGameWorld) {
	    if(this.world) this.world.off("map-change", this.mapChangeHandler)
	    this.world = world
        if(this.world) this.world.on("map-change", this.mapChangeHandler)
    }

    draw(dt: number) {
        this.mapDrawer.drawMap(this.world.map, this.camera)
        this.drawEntities()
        this.drawPlayers(dt)
        this.drawParticles()
        this.explodePoolDrawer.draw(this.world.explosionEffectPool, dt)
    }

    private drawParticles() {
        if(this.world.particles.length) {
            this.particleProgram.use()
            this.particleProgram.prepare()

            for(let particle of this.world.particles) {
                this.particleProgram.drawParticle(particle)
            }

            this.particleProgram.matrixUniform.setMatrix(this.camera.matrix.m)
            this.particleProgram.draw()
        }
    }

    private drawPlayers(dt: number) {
        let players = this.world.players
        for(let player of players.values()) {
            (player.tank as ClientTank).drawer.draw(this.camera, dt)
        }
    }

    private drawEntities() {
        let entities = this.world.entities
        if(entities.size > 0) {
            this.entityProgram.use()
            this.entityProgram.prepare()

            for(let entity of entities.values()) {
                entity.drawer.draw(this.entityProgram)
            }

            this.entityProgram.matrixUniform.setMatrix(this.camera.matrix.m)
            this.entityProgram.draw()
        }
    }
}

export default WorldDrawer;