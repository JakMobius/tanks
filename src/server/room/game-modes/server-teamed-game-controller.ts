import ServerGameController from "src/server/room/game-modes/server-game-controller";
import Team from "src/server/team";

export interface ServerTeamedGameControllerConfig {
    teams?: number
}

export default abstract class ServerTeamedGameController extends ServerGameController {
    teams: Team[] = []

    protected constructor(config: ServerTeamedGameControllerConfig) {
        super();
        this.createTeams(config.teams)
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