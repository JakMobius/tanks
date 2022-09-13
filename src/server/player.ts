import EventEmitter from "../utils/event-emitter";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import ServerEntityPilotListComponent from "./entity/components/server-entity-pilot-list-component";
import Entity from "../utils/ecs/entity";
import PlayerRespawnEvent from "../events/player-respawn-event";
import PlayerConnectEvent, {PlayerConnectDeclineReason} from "../events/player-connect-event";
import PlayerDisconnectEvent from "../events/player-disconnect-event";
import Team from "./team";

export interface PlayerConfig {
    nick?: string
}

export default class Player extends EventEmitter {
    public world: Entity
    public tank: Entity
    public nick: string;
    public team?: Team

    private tankEventHandler = new BasicEventHandlerSet()

    constructor(config?: PlayerConfig) {
        super()
        config = config || {}
        this.nick = config.nick

        this.on("team-set", () => {
            if(this.tank) this.tank.emit("pilot-team-set")
            if(this.world) this.world.emit("player-team-set", this)
        })

        this.tankEventHandler.on("death", () => {
            this.world.emit("player-death", this)
        })
    }

    private setWorld(world: Entity) {
        this.world = world
        this.emit("world-set")
    }

    connectToWorld(world: Entity): PlayerConnectDeclineReason {
        this.setTank(null)
        if(this.world == world) return null;
        if(this.world) {
            this.world.emit("player-disconnect", new PlayerDisconnectEvent(this))
        }

        this.setTeam(null)

        // TODO: world should be set after player-connect event to reduce
        // overhead of two world-set events

        this.setWorld(world)

        if(this.world) {
            let event = new PlayerConnectEvent(this)
            this.world.emit("player-connect", event)
            if(event.declined) {
                this.setWorld(null)
                return event.declineReason
            }
        }

        return null
    }

    setTank(tank: Entity) {
        if(this.tank == tank) return;
        if(this.tank) {
            this.disconnectFromTank()
        }
        this.tank = tank
        if(this.tank) {
            this.connectToTank()
        }
        this.tankEventHandler.setTarget(tank)
        this.emit("tank-set")
    }

    private disconnectFromTank() {
        const tankPlayerList = this.tank.getComponent(ServerEntityPilotListComponent)
        tankPlayerList.removePlayer(this)
    }

    private connectToTank() {
        let tankPlayerList = this.tank.getComponent(ServerEntityPilotListComponent)
        tankPlayerList.addPlayer(this)
    }

    respawn() {
        if(!this.tank) return
        let event = new PlayerRespawnEvent(this)
        this.world.emit("player-respawn", event)
        if(!event.cancelled) {
            this.tank.emit("respawn")
        }
    }

    setTeam(team: Team) {
        if(this.team) {
            this.team.removePlayer(this)
        }
        this.team = team
        this.emit("team-set")
        if(this.team) {
            this.team.addPlayer(this)
        }
    }
}