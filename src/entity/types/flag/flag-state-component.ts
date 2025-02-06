import Entity from "src/utils/ecs/entity";
import * as Box2D from "@box2d/core";
import TransformComponent from "src/entity/components/transform-component";
import PhysicalComponent from "src/entity/components/physics-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class FlagStateComponent extends EventHandlerComponent {
    carrier: Entity | null = null
    position: Box2D.XY | null = null
    teamId: number | null = null

    constructor() {
        super()
        this.eventHandler.on("tick", () => {
            this.updatePosition()
        })
    }

    setTeam(teamId: number) {
        this.teamId = teamId
        this.entity.emit("flag-state-changed")
    }

    setCarrier(carrier: Entity) {
        this.carrier = carrier
        this.position = null
        this.updatePosition()
        this.entity.emit("flag-state-changed")
    }

    setPosition(position: Box2D.XY) {
        this.carrier = null
        this.position = position
        this.updatePosition()
        this.entity.emit("flag-state-changed")
    }

    private updatePosition() {
        if(this.carrier) {
            let carrierTransform = this.carrier.getComponent(TransformComponent)
            let carryPointX = carrierTransform.transform.transformX(0, -1.3)
            let carryPointY = carrierTransform.transform.transformY(0, -1.3)

            carryPointX -= 1.35 // Shift of the flagpole relative to the center of the texture
            carryPointY -= 1.85 // So the bottom of the flag is at the "anchor point"

            this.entity.getComponent(PhysicalComponent).setPositionAngle({
                x: carryPointX,
                y: carryPointY
            }, 0)
        } else if(this.position) {
            this.entity.getComponent(PhysicalComponent).setPositionAngle(this.position, 0)
        }
    }
}