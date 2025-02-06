import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import MortarBallHeightComponent from "src/entity/components/network/mortar-ball-height/mortar-ball-height-component";
import * as Box2D from "@box2d/core";
import BulletBehaviour from "src/server/entity/bullet-behaviour";
import PhysicalComponent from "src/entity/components/physics-component";
import Entity from "src/utils/ecs/entity";

export default class MortarBallBulletBehaviour extends EventHandlerComponent {

    contacts = new Set<Box2D.b2Contact>()
    inTheAir = false

    constructor() {
        super();
        this.eventHandler.on("physics-tick", (dt) => this.onPhysicsTick())
        this.eventHandler.on("should-collide", () => {
            return !this.inTheAir
        })
    }

    onAttach(entity: Entity) {
        super.onAttach(entity);

        this.entity.getComponent(MortarBallHeightComponent).vSpeed = 4
    }

    private onPhysicsTick() {
        const height = this.entity.getComponent(MortarBallHeightComponent).height
        const newShouldCollide = height > 4
        const shouldFilter = newShouldCollide != this.inTheAir
        this.inTheAir = height > 0.5

        if(shouldFilter) {
            let body = this.entity.getComponent(PhysicalComponent).body
            for(let fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
                fixture.Refilter()
            }
        }

        if(height <= 0) this.entity.getComponent(BulletBehaviour).die()
    }
}