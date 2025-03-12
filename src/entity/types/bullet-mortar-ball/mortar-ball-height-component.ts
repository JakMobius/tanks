import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class MortarBallHeightComponent extends EventHandlerComponent {
    height: number = 0
    vSpeed: number = 0
    gravity: number = 9.8

    constructor() {
        super();

        this.eventHandler.on("physics-tick", (dt) => {
            this.height += this.vSpeed * dt
            this.vSpeed -= this.gravity * dt
        })
    }
}