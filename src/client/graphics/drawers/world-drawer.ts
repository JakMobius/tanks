
import TextureProgram from '../../graphics/programs/texture-program';
import Camera from "../../camera";
import Screen from '../screen'
import ClientGameWorld from "../../client-game-world";
import ExplodePoolDrawer from "../../effects/explode-pool-drawer";
import MapDrawer from "./map-drawer";
import EventEmitter from "../../../utils/event-emitter";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import MapDebugDrawer from "./map-debug-drawer";
import ParticleDrawer from "./particle-drawer";
import ClientEntity from "../../entity/client-entity";
import ConvexShapeProgram from "../programs/convex-shapes/convex-shape-program";
import EntityDrawer from "./entity-drawer";
import DrawPhase from "./draw-phase";
import BasicCameraProgramController from "../programs/controllers/basic-camera-program-controller";
import TruckProgram from "../programs/truck-program";
import LightMaskTextureProgram from "../programs/light-mask-texture/light-mask-texture-program";
import MaskTextureProgramController from "../programs/light-mask-texture/light-mask-texture-program-controller";

export default class WorldDrawer extends EventEmitter {
	public readonly camera: Camera
	public readonly screen: Screen
    public readonly convexShapeProgramController: BasicCameraProgramController
    public readonly textureProgramController: BasicCameraProgramController
    public readonly truckProgramController: BasicCameraProgramController
    public readonly maskTextureProgramController: MaskTextureProgramController
    public readonly debugDrawer: MapDebugDrawer
    public readonly explodePoolDrawer: ExplodePoolDrawer
    public debugDrawOn: boolean = false
    private world: ClientGameWorld;
	private mapDrawer: MapDrawer
    private entityDrawers = new Map<number, EntityDrawer>()
    private worldEventHandler = new BasicEventHandlerSet()

    private mapDrawPhase = new DrawPhase()
    private entityDrawPhase = new DrawPhase()
    private particleDrawPhase = new DrawPhase()
    private debugDrawPhase = new DrawPhase()
    static depths = {
	    mine: 0.10,
        tankTrack: 0.09,
        tankBody: 0.08,
        bullet: 0.07,
        tankTop: 0.06,
	    block: 0.05,
        blockCrack: 0.04
    }

    constructor(camera: Camera, screen: Screen, world: ClientGameWorld) {
	    super()

        this.camera = camera
        this.screen = screen

        const convexShapeProgram = new ConvexShapeProgram(this.screen.ctx)
        const textureProgram = new TextureProgram(this.screen.ctx)
        const truckProgram = new TruckProgram(this.screen.ctx)
        const maskTextureProgram = new LightMaskTextureProgram(this.screen.ctx)

        this.truckProgramController = new BasicCameraProgramController(truckProgram, this.camera)
        this.convexShapeProgramController = new BasicCameraProgramController(convexShapeProgram, this.camera)
        this.textureProgramController = new BasicCameraProgramController(textureProgram, this.camera)
        this.maskTextureProgramController = new MaskTextureProgramController(maskTextureProgram, this.camera)

        this.mapDrawPhase.register(this.textureProgramController)

        this.entityDrawPhase.register(this.truckProgramController)
        this.entityDrawPhase.register(this.convexShapeProgramController)
        this.entityDrawPhase.register(this.maskTextureProgramController)
        this.entityDrawPhase.register(this.textureProgramController)

        this.particleDrawPhase.register(this.convexShapeProgramController)
        this.debugDrawPhase.register(this.convexShapeProgramController)

        this.explodePoolDrawer = new ExplodePoolDrawer(this.camera, this.screen)
        this.debugDrawer = new MapDebugDrawer(this.debugDrawPhase)
        this.mapDrawer = new MapDrawer(this.screen)

        this.worldEventHandler.on("map-change", () => this.onWorldMapChanged())
        this.worldEventHandler.on("entity-create", (player) => this.onEntityCreate(player))
        this.worldEventHandler.on("entity-remove", (player) => this.onEntityRemove(player))
        this.worldEventHandler.on("map-block-update", () => this.onMapBlockUpdate())

        this.setWorld(world)
    }

    onMapBlockUpdate() {
        this.mapDrawer.reset()
        this.setNeedsRedraw()
    }

    setWorld(world: ClientGameWorld) {
        this.world = world

	    this.entityDrawers.clear()

        if(this.world) {
            for (let entity of this.world.entities.values()) {
                this.setupDrawerForEntity(entity)
            }
        }

        this.worldEventHandler.setTarget(this.world)
        this.debugDrawer.setWorld(world)

	    this.onWorldMapChanged()
    }

    onEntityCreate(entity: ClientEntity) {
	    this.setupDrawerForEntity(entity)
    }

    onEntityRemove(entity: ClientEntity) {
	    this.entityDrawers.delete(entity.model.id)
    }

    onWorldMapChanged() {
        this.mapDrawer.reset()
        this.setNeedsRedraw()
    }

    draw(dt: number) {
        if(this.world.map) this.mapDrawer.drawMap(this.world.map, this.camera)
        this.drawEntities()
        this.drawParticles()
        this.explodePoolDrawer.draw(this.world.explosionEffectPool, dt)
        if(this.debugDrawOn) this.debugDrawer.draw()
    }

    private drawParticles() {
        if(this.world.particles.length) {
            this.particleDrawPhase.prepare()

            for(let particle of this.world.particles) {
                ParticleDrawer.drawParticle(this.particleDrawPhase, particle)
            }

            this.particleDrawPhase.draw()
        }
    }
    private drawEntities() {
        let entities = this.world.entities

        if(entities.size > 0) {
            this.entityDrawPhase.prepare()

            for(let entityDrawer of this.entityDrawers.values()) {
                if(!entityDrawer.entity.hidden) {
                    entityDrawer.draw(this.entityDrawPhase)
                }
            }

            this.entityDrawPhase.draw()
        }
    }

    private setNeedsRedraw() {
        this.emit("redraw")
    }

    private setupDrawerForEntity(entity: ClientEntity) {
        let entityClass = (entity.constructor as typeof ClientEntity)
        let DrawerClass = entityClass.getDrawer()
        this.entityDrawers.set(entity.model.id, new DrawerClass(entity))
    }
}