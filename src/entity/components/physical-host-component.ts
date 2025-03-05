import * as Box2D from "@box2d/core";
import PhysicalComponent from "src/entity/components/physics-component";
import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import GameWorldContactListener from "src/contact-listener";
import GameWorldContactFilter from "src/contact-filter";

export interface PhysicalHostComponentConfig {
    gravity?: Box2D.XY
    physicsTick: number;
    iterations: Box2D.b2StepConfig;
}

export default class PhysicalHostComponent implements Component {

    physicalComponents: PhysicalComponent[] = []
    entity?: Entity | null

    public world: Box2D.b2World
    public physicsTick: number
    public iterations: Box2D.b2StepConfig
    public worldTicks: number = 0
    public worldTicksModulo: number = 65536

    contactListener: GameWorldContactListener
    contactFilter: GameWorldContactFilter

    constructor(config: PhysicalHostComponentConfig) {
        this.physicsTick = config.physicsTick
        this.iterations = config.iterations

        this.world = Box2D.b2World.Create(config.gravity ?? {x: 0, y: 0})

        this.setupContactListener()
        this.setupContactFilter()
    }

    beforePhysics() {
        for(let component of this.physicalComponents) {
            component.beforePhysics();
        }
    }

    tickPhysics() {
        this.world.ClearForces()
        for(let component of this.physicalComponents) {
            component.onPhysicsTick(this.physicsTick);
        }

        this.worldTicks = (this.worldTicks + 1) % this.worldTicksModulo

        if(this.iterations.positionIterations > 0 && this.iterations.velocityIterations > 0 && this.physicsTick > 0) {
            this.world.Step(this.physicsTick, this.iterations);
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