import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Team from "src/server/team";

export default class PlayerTeamComponent extends EventHandlerComponent {

    team: Team | null = null

    constructor() {
        super();
        this.eventHandler.on("world-set", () => {
            this.setTeam(null)
        })
    }

    setTeam(team: Team) {
        if(this.team) {
            this.team.removePlayer(this.entity)
        }
        this.team = team
        this.entity.emit("team-set")
        if(this.team) {
            this.team.addPlayer(this.entity)
        }
    }
}