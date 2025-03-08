import { PropertyInspector, VectorProperty } from "src/entity/components/inspector/property-inspector";
import ServerGameController from "src/server/room/game-modes/server-game-controller";
import Team from "src/server/team";

export default abstract class ServerTeamedGameController extends ServerGameController {
    teams: Team[] = []
    singleTeamMatchTime = 15

    protected constructor() {
        super();

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            inspector.addProperty(new VectorProperty("singleTeamMatchTime", 1)
                .withName("Задержка победы без соперников")
                .withGetter(() => [this.singleTeamMatchTime])
                .withSetter((time) => this.singleTeamMatchTime = time[0])
                .replaceNaN()
                .requirePositive()
            )
        })
    }

    public leastPopulatedTeam() {
        let leastPopulatedTeam = null
        let leastPopulatedCount = Infinity
        for(let team of this.teams) {
            if(team.players.length < leastPopulatedCount) {
                leastPopulatedTeam = team
                leastPopulatedCount = team.players.length
            }
        }
        return leastPopulatedTeam
    }

    private createTeams(teams: number) {
        for (let i = 0; i < teams; i++) {
            let team = new Team()
            team.id = i
            this.teams.push(team)
        }
    }
}