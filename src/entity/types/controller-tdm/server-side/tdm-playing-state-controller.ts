import ServerTDMController from "src/entity/types/controller-tdm/server-side/tdm-controller";
import {TDMMatchOverStateController} from "src/entity/types/controller-tdm/server-side/tdm-match-over-state-controller";
import WorldStatisticsComponent from "src/entity/components/world-statistics/world-statistics-component";
import {TDMGameState, TDMGameStateType, TDMTeamStatistics} from "src/entity/types/controller-tdm/tdm-game-state";
import WorldPlayerStatisticsComponent from "src/server/entity/components/world-player-statistics-component";
import {TDMPlayerWaitingStateController} from "src/entity/types/controller-tdm/server-side/tdm-player-waiting-state";
import DamageRecorderComponent from "src/server/entity/components/damage-recorder-component";
import Team from "src/server/team";
import NoFriendlyFireScript from "src/server/room/game-modes/scripts/no-friendly-fire-script";
import QuickMatchEndScript from "src/server/room/game-modes/scripts/quick-match-end-script";
import PlayerCountCallbackScript from "src/server/room/game-modes/scripts/player-count-callback-script";
import MatchTimerExpireScript from "src/server/room/game-modes/scripts/match-timer-expire-script";
import PlayerTeamComponent from "src/entity/types/player/server-side/player-team-component";
import Entity from "src/utils/ecs/entity";
import PlayerRespawnActionComponent from "src/entity/types/player/server-side/player-respawn-action-component";
import {chooseRandomIndex} from "src/utils/utils";
import { TeamedRespawnScript } from "src/server/room/game-modes/scripts/respawn-script";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";
import ServerGameStateController from "src/server/room/game-modes/server-game-state-controller";
import TDMController from "src/entity/types/controller-tdm/server-side/tdm-controller";

export class TDMPlayingStateController extends ServerGameStateController<TDMController, TDMGameState> {

    private teamStatistics = new Map<Team, TDMTeamStatistics>()
    private gameRunning = false;

    constructor(controller: ServerTDMController) {
        super(controller)

        this.worldEventHandler.on("player-connect", (player) => this.onPlayerConnect(player))
        this.worldEventHandler.on("player-death", (player) => this.onPlayerDeath(player))

        this.addScript(new NoFriendlyFireScript(this.controller))
        this.addScript(new QuickMatchEndScript(this.controller, this.controller.singleTeamMatchTime))

        this.addScript(new PlayerCountCallbackScript(this.controller, (playerCount: number) => {
            if(!this.gameRunning) return
            let teamCount = this.getTeamCount()
            if (teamCount == 0) this.abortMatch()
            if (this.getScript(QuickMatchEndScript).setQuickMatchEnd(teamCount == 1)) {
                this.controller.triggerStateBroadcast()
            }
        }))

        this.addScript(new TeamedRespawnScript(this.controller, { usePlayerTeam: true }))

        this.addScript(new MatchTimerExpireScript(this.controller, () => {
            this.endMatch()
        }))
    }

    activate() {
        super.activate()

        let timeComponent = this.controller.entity.getComponent(GameTimeComponent)

        this.controller.world.getComponent(WorldStatisticsComponent)
            .getMatchLeftTimerComponent().countdownFrom(timeComponent.matchTime)
        this.controller.world.getComponent(WorldPlayerStatisticsComponent).resetAllStatistics()

        this.setupTeams()
        // TODO: reload map
        this.gameRunning = true
    }

    private setupTeams() {
        this.teamStatistics.clear()
        for(let team of this.controller.teams) {
            this.teamStatistics.set(team, {
                team: team.id,
                score: 0
            })
        }

        let playerArray = Array.from(this.controller.players)

        while (playerArray.length) {
            let randomPlayer = playerArray.splice(chooseRandomIndex(playerArray), 1)[0]
            let randomPlayerTeamComponent = randomPlayer.getComponent(PlayerTeamComponent)
            if(randomPlayerTeamComponent.team === null) {
                randomPlayerTeamComponent.setTeam(this.controller.leastPopulatedTeam())
            }
            randomPlayer.getComponent(PlayerRespawnActionComponent).performRespawnAction()
        }
    }

    private onPlayerConnect(player: Entity) {
        const playerTeamComponent = player.getComponent(PlayerTeamComponent)
        playerTeamComponent.setTeam(this.controller.leastPopulatedTeam())
    }

    private getTeamCount() {
        let teams = this.controller.teams
        let notEmptyTeams = 0

        for (let team of teams) {
            if (team.players.length) notEmptyTeams++
        }

        return notEmptyTeams
    }

    private onPlayerDeath(player: Entity) {
        const damageRecorder = this.controller.world.getComponent(DamageRecorderComponent)

        let killer = damageRecorder.getDamageData(player).damagers[0]
        if(killer && killer !== player) {
            this.scorePlayer(killer, 10)
        }
    }

    private scorePlayer(player: Entity, score: number) {
        const playerTeamComponent = player.getComponent(PlayerTeamComponent)
        const statistics = this.controller.world.getComponent(WorldPlayerStatisticsComponent)
        statistics.scorePlayer(player, score)

        if(playerTeamComponent.team) {
            let teamStatistics = this.teamStatistics.get(playerTeamComponent.team)
            teamStatistics.score += score
        }
    }

    private abortMatch() {
        this.controller.activateGameState(new TDMPlayerWaitingStateController(this.controller))
    }

    private endMatch() {
        let statistics = Array.from(this.teamStatistics.values())
        this.controller.activateGameState(new TDMMatchOverStateController(this.controller, statistics))
    }

    getState(): TDMGameState {
        return {
            state: TDMGameStateType.playing,
            quickMatchEnd: this.getScript(QuickMatchEndScript).quickMatchEnd
        }
    }
}