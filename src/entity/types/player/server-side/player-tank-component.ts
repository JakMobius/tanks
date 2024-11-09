import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";

export default class PlayerTankComponent extends EventHandlerComponent {

    public tank: Entity
    public tankEventHandler = new BasicEventHandlerSet()

    constructor() {
        super();
        this.eventHandler.on("world-set", () => {
            this.setTank(null)
        })

        this.eventHandler.on("team-set", () => {
            if(this.tank) this.tank.emit("pilot-team-set")
        })

        this.tankEventHandler.on("death", () => {
            this.entity.emit("death")
        })
    }

    setTank(tank: Entity) {
        if(this.tank == tank) return;

        if(this.tank) {
            this.disconnectFromTank()
        }

        this.tank = tank
        this.tankEventHandler.setTarget(tank)

        if(this.tank) {
            this.connectToTank()
        }

        this.entity.emit("tank-set", tank)
    }

    private disconnectFromTank() {
        const tankPlayerList = this.tank.getComponent(ServerEntityPilotComponent)
        tankPlayerList.setPilot(null)
    }

    private connectToTank() {
        let tankPlayerList = this.tank.getComponent(ServerEntityPilotComponent)
        tankPlayerList.setPilot(this.entity)
    }
}