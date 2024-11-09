import * as Box2D from "src/library/box2d";
import PhysicalComponent from "src/entity/components/physics-component";
import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import GameWorldContactListener from "src/contact-listener";
import GameWorldContactFilter from "src/contact-filter";

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
    public physicsTick: number
    public positionSteps: number
    public velocitySteps: number
    public worldTicks: number = 0
    public worldTicksModulo: number = 65536

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

        this.worldTicks = (this.worldTicks + 1) % this.worldTicksModulo

        if(this.velocitySteps > 0 && this.positionSteps > 0) {
            this.world.Step(this.physicsTick, this.velocitySteps, this.positionSteps);
        }
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