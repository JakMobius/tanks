import * as Box2D from "./library/box2d";
import PhysicalComponent from "./entity/components/physics-component";
import {Component} from "./utils/ecs/component";
import Entity from "./utils/ecs/entity";
import GameWorldContactListener from "./contact-listener";
import GameWorldContactFilter from "./contact-filter";

export interface PhysicalHostComponentConfig {
    gravity?: Box2D.XY
    physicsTick: number;
    positionSteps: number;
    velocitySteps: number;
}

export default class PhysicalHostComponent implements Component {

    physicalComponents: PhysicalComponent[] = []
    entity?: Entity | null

    public world: Box2D.World
    public physicsTick: number;
    public positionSteps: number;
    public velocitySteps: number;

    contactListener: GameWorldContactListener
    contactFilter: GameWorldContactFilter

    constructor(config: PhysicalHostComponentConfig) {
        this.physicsTick = config.physicsTick
        this.positionSteps = config.positionSteps
        this.velocitySteps = config.velocitySteps

        this.world = new Box2D.World(config.gravity ?? {x: 0, y: 0})

        this.setupContactListener()
        this.setupContactFilter()
    }

    tickPhysics() {
        this.world.ClearForces()
        for(let component of this.physicalComponents) {
            component.onPhysicsTick(this.physicsTick);
        }
        this.world.Step(this.physicsTick, this.velocitySteps, this.positionSteps);
    }

    onAttach(entity: Entity) {
        this.entity = entity;
        this.entity.emit("physical-host-attached", this)
    }

    onDetach() {
        this.entity = null
        for(let component of this.physicalComponents) {
            component.setHost(null)
        }
        this.physicalComponents = []
    }

    registerComponent(component: PhysicalComponent) {
        this.physicalComponents.push(component)
    }

    destroyComponent(component: PhysicalComponent) {
        let index = this.physicalComponents.indexOf(component)
        if(index < 0) return;
        this.physicalComponents.splice(index, 1)
    }

    protected setupContactListener() {
        this.contactListener = new GameWorldContactListener()
        this.world.SetContactListener(this.contactListener)
    }

    protected setupContactFilter() {
        this.contactFilter = new GameWorldContactFilter()
        this.world.SetContactFilter(this.contactFilter)
    }
}