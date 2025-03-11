import { PropertyInspector, VectorProperty } from "src/entity/components/inspector/property-inspector";
import SpawnzoneComponent from "src/entity/types/spawn-zone/spawnzone-component";
import ServerGameController from "src/server/room/game-modes/server-game-controller";
import Team from "src/server/team";
import Entity from "src/utils/ecs/entity";
import GameSpawnzonesComponent from "./game-spawnzones-component";

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

    private createTeams() {
        this.teams = []
        
        let spawnzonesComponent = this.entity.getComponent(GameSpawnzonesComponent)
        let teams = new Set<number>()

        for(let entity of spawnzonesComponent.spawnzones) {
            let zone = entity.getComponent(SpawnzoneComponent)
            teams.add(zone.team)
        }

        for (let teamId of teams) {
            let team = new Team()
            team.id = teamId
            this.teams.push(team)
        }
    }

    setWorld(world: Entity): void {
        super.setWorld(world)
        this.createTeams()
    }
}