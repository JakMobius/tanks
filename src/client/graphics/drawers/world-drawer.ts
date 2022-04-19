import TextureProgram from '../../graphics/programs/texture-program';
import Camera from "../../camera";
import Screen from '../screen'
import ExplodePoolDrawer from "../../effects/explode-pool-drawer";
import MapDrawer from "./map-drawer";
import EventEmitter from "../../../utils/event-emitter";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import MapDebugDrawer from "./map-debug-drawer";
import ParticleDrawer from "./particle-drawer";
import ConvexShapeProgram from "../programs/convex-shapes/convex-shape-program";
import EntityDrawer from "./entity-drawer";
import DrawPhase from "./draw-phase";
import BasicCameraProgramController from "../programs/controllers/basic-camera-program-controller";
import TruckProgram from "../programs/truck-program";
import LightMaskTextureProgram from "../programs/light-mask-texture/light-mask-texture-program";
import MaskTextureProgramController from "../programs/light-mask-texture/light-mask-texture-program-controller";
import TilemapComponent from "../../../physics/tilemap-component";
import ExplodeEffectPool from "../../../effects/world/explode/explode-effect-pool";
import ParticleHost from "../../particle-host";
import Entity from "../../../utils/ecs/entity";
import {Component} from "../../../utils/ecs/component";

export default class WorldDrawer extends EventEmitter implements Component {
    public entity: Entity
	public readonly camera: Camera
	public readonly screen: Screen
    public readonly convexShapeProgramController: BasicCameraProgramController
    public readonly textureProgramController: BasicCameraProgramController
    public readonly truckProgramController: BasicCameraProgramController
    public readonly maskTextureProgramController: MaskTextureProgramController
    public readonly debugDrawer: MapDebugDrawer
    public readonly explodePoolDrawer: ExplodePoolDrawer
    public debugDrawOn: boolean = false
	private mapDrawer: MapDrawer
    private entityDrawers = new Set<EntityDrawer>()
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

    constructor(camera: Camera, screen: Screen) {
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
        this.worldEventHandler.on("map-block-update", () => this.onMapBlockUpdate())
    }

    onMapBlockUpdate() {
        this.mapDrawer.reset()
        this.setNeedsRedraw()
    }

    onWorldMapChanged() {
        this.mapDrawer.reset()
        this.setNeedsRedraw()
    }

    draw(dt: number) {
        const mapComponent = this.entity.getComponent(TilemapComponent)
        if(mapComponent) {
            const map = mapComponent.map
            if(map) this.mapDrawer.drawMap(map, this.camera)
        }

        this.drawEntities()
        this.drawParticles()

        let explodePool = this.entity.getComponent(ExplodeEffectPool)
        if(explodePool) {
            this.explodePoolDrawer.draw(explodePool, dt)
        }
        if(this.debugDrawOn) this.debugDrawer.draw()
    }

    private drawParticles() {
        const particleComponent = this.entity.getComponent(ParticleHost)
        if(particleComponent.particles.length) {
            this.particleDrawPhase.prepare()

            for(let particle of particleComponent.particles) {
                ParticleDrawer.drawParticle(this.particleDrawPhase, particle)
            }

            this.particleDrawPhase.draw()
        }
    }
    private drawEntities() {
        if (this.entityDrawers.size === 0) return;

        this.entityDrawPhase.prepare()
        for (let entityDrawer of this.entityDrawers.values()) {
            entityDrawer.draw(this.entityDrawPhase)
        }
        this.entityDrawPhase.draw()
    }

    private setNeedsRedraw() {
        this.emit("redraw")
    }

    setWorld(world: Entity) {
        this.entity = world
        this.entityDrawers.clear()
        this.worldEventHandler.setTarget(this.entity)
        this.debugDrawer.setWorld(this.entity)
        this.onWorldMapChanged()
    }

    onAttach(entity: Entity): void {
        this.setWorld(entity)
        entity.propagateEvent("world-drawer-attached", this)
    }

    onDetach(): void {
        this.setWorld(null)
        for(let drawer of this.entityDrawers) {
            drawer.setDrawer(null)
        }
        this.entityDrawers.clear()
    }

    addDrawer(drawer: EntityDrawer) {
        this.entityDrawers.add(drawer)
    }

    removeDrawer(drawer: EntityDrawer) {
        this.entityDrawers.delete(drawer)
    }
}