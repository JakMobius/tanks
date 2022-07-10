import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import {Vec2} from "../../../library/box2d";
import PhysicalComponent from "../../../entity/components/physics-component";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";

export default class ServerPositionComponent implements Component {
    public entity: Entity | null;
    public serverVelocity: Vec2 = new Vec2();
    public serverPosition: Vec2 = new Vec2();
    public serverAngle: number = 0
    public serverAngularVelocity: number = 0
    public serverPositionUpdateDate: number = 0
    public eventHandler = new BasicEventHandlerSet()
    private isFirstTick = false

    constructor() {
        this.eventHandler.on("tick", (dt: number) => this.onTick(dt))
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(this.entity)
    }

    private onTick(dt: number) {
        if(this.serverPositionUpdateDate && this.isFirstTick) {
            const body = this.entity.getComponent(PhysicalComponent).getBody()

            let serverX = this.serverPosition.x
            let serverY = this.serverPosition.y

            let timeSinceUpdate = (Date.now() - this.serverPositionUpdateDate) / 1000

            serverX += this.serverVelocity.x * timeSinceUpdate
            serverY += this.serverVelocity.y * timeSinceUpdate

            // TODO: should it use component methods?
            body.SetPositionXY(serverX, serverY)
            body.SetLinearVelocity(this.serverVelocity)
            body.SetAngle(this.serverAngle + this.serverAngularVelocity * timeSinceUpdate)
            body.SetAngularVelocity(this.serverAngularVelocity)

            this.isFirstTick = false
        }
    }

    serverPositionReceived() {
        this.serverPositionUpdateDate = Date.now()
        this.isFirstTick = true
    }
}