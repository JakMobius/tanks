import WorldStatisticsComponent from "src/entity/components/world-statistics/world-statistics-component";
import WorldPlayerStatisticsComponent from "src/server/entity/components/world-player-statistics-component";
import DamageRecorderComponent from "src/server/entity/components/damage-recorder-component";
import QuickMatchEndScript from "src/server/room/game-modes/scripts/quick-match-end-script";
import PlayerCountCallbackScript from "src/server/room/game-modes/scripts/player-count-callback-script";
import MatchTimerExpireScript from "src/server/room/game-modes/scripts/match-timer-expire-script";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";
import CTFController from "src/entity/types/controller-ctf/server-side/ctf-controller";
import {
    CTFEventData,
    CTFFlagEventType,
    CTFGameState,
    CTFGameStateType,
    CTFTeamStatistics,
    localizedCTFFlagEventTypes
} from "src/entity/types/controller-ctf/ctf-game-state";
import {CTFPlayerWaitingStateController} from "src/entity/types/controller-ctf/server-side/ctf-player-waiting-state";
import {CTFMatchOverStateController} from "src/entity/types/controller-ctf/server-side/ctf-match-over-state-controller";
import Team from "src/server/team";
import CTFScript from "src/entity/types/controller-ctf/server-side/ctf-script";
import PlayerTeamComponent from "src/entity/types/player/server-side/player-team-component";
import Entity from "src/utils/ecs/entity";
import PlayerRespawnActionComponent from "src/entity/types/player/server-side/player-respawn-action-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import {chooseRandomIndex} from "src/utils/utils";
import PlayerNickComponent from "src/entity/types/player/server-side/player-nick-component";
import RoomClientComponent from "src/server/room/components/room-client-component";
import TeamColor from "src/utils/team-color";
import { TeamedRespawnScript } from "src/server/room/game-modes/scripts/player-spawn-position-script";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";
import { FlagStateComponent } from "../../flag/server-side/flag-state-component";
import ServerGameStateController from "src/server/room/game-modes/server-game-state-controller";

export default class CTFPlayingStateController extends ServerGameStateController<CTFController, CTFGameState, CTFEventData> {
    private teamStatistics = new Map<Team, CTFTeamStatistics>();

    constructor(controller: CTFController) {
        super(controller)

        this.worldEventHandler.on("player-connect", (player) => this.onPlayerConnect(player))
        this.worldEventHandler.on("player-death", (player) => this.onPlayerDeath(player))
        this.worldEventHandler.on("flag-delivery", (flagState, tank) => this.onFlagDelivered(flagState, tank))
        this.worldEventHandler.on("flag-capture", (flagState, tank) => this.onFlagCapture(flagState, tank))
        this.worldEventHandler.on("flag-drop", (flagState, tank) => this.onFlagDrop(flagState, tank))
        this.worldEventHandler.on("flag-return", (flagState, tank) => this.onFlagReturn(flagState, tank))

        this.addScript(new PlayerCountCallbackScript(this.controller, (playerCount: number) => {
            if (playerCount == 0) this.abortMatch()
            this.getScript(QuickMatchEndScript).setQuickMatchEnd(playerCount == 1)
            this.controller.triggerStateBroadcast()
        }))

        this.addScript(new QuickMatchEndScript(this.controller, this.controller.singleTeamMatchTime))

        this.addScript(new TeamedRespawnScript(this.controller, { usePlayerTeam: true }))

        this.addScript(new MatchTimerExpireScript(this.controller, () => {
            this.endMatch()
        }))

        this.addScript(new CTFScript(this.controller))
    }

    activate() {
        super.activate()
        const timeComponent = this.controller.entity.getComponent(GameTimeComponent)
        this.controller.world.getComponent(WorldStatisticsComponent)
            .getMatchLeftTimerComponent().countdownFrom(timeComponent.matchTime)
        this.controller.world.getComponent(WorldPlayerStatisticsComponent).resetAllStatistics()
        // TODO: reload map
        this.controller.triggerStateBroadcast()
        this.setupTeams()
    }

    private setupTeams() {
        this.teamStatistics.clear()
        for (let team of this.controller.teams) {
            this.teamStatistics.set(team, {
                team: team.id,
                score: 0
            })
        }

        let playerArray = this.controller.world.getComponent(ServerWorldPlayerManagerComponent).players.slice()

        while (playerArray.length) {
            let randomPlayer = playerArray.splice(chooseRandomIndex(playerArray), 1)[0]
            let teamComponent = randomPlayer.getComponent(PlayerTeamComponent)

            if (teamComponent.team == null) {
                teamComponent.setTeam(this.controller.leastPopulatedTeam())
            }
            randomPlayer.getComponent(PlayerRespawnActionComponent).performRespawnAction()
        }
    }

    private onPlayerDeath(player: Entity) {
        let damageRecorder = this.controller.world.getComponent(DamageRecorderComponent)

        let killer = damageRecorder.getDamageData(player).damagers[0]
        if (killer && killer !== player) {
            let statistics = this.controller.world.getComponent(WorldPlayerStatisticsComponent)
            statistics.scorePlayer(killer, 10)
        }
    }

    private abortMatch() {
        this.controller.activateGameState(new CTFPlayerWaitingStateController(this.controller))
    }

    private endMatch() {
        let statistics = Array.from(this.teamStatistics.values())
        this.controller.activateGameState(new CTFMatchOverStateController(this.controller, statistics))
    }

    private scorePlayer(player: Entity, score: number) {
        const playerTeamComponent = player.getComponent(PlayerTeamComponent)
        const statistics = this.controller.world.getComponent(WorldPlayerStatisticsComponent)
        statistics.scorePlayer(player, score)

        if (playerTeamComponent.team) {
            let teamStatistics = this.teamStatistics.get(playerTeamComponent.team)
            teamStatistics.score += score
        }
    }

    getState(): CTFGameState {
        return {
            state: CTFGameStateType.playing,
            quickMatchEnd: this.getScript(QuickMatchEndScript).quickMatchEnd
        }
    }

    private onPlayerConnect(player: Entity) {
        let teamComponent = player.getComponent(PlayerTeamComponent)
        teamComponent.setTeam(this.controller.leastPopulatedTeam())
    }

    private getTankPilot(tank: Entity) {
        if (!tank) {
            return null
        }
        const pilotComponent = tank.getComponent(ServerEntityPilotComponent)
        if (!pilotComponent) return null
        return pilotComponent.pilot
    }

    private broadcastFlagEvent(event: CTFFlagEventType, flagTeam: number, pilot: Entity | null) {
        let playerNick = pilot?.getComponent(PlayerNickComponent).nick
        let playerTeam = pilot?.getComponent(PlayerTeamComponent).team.id

        this.sendEvent({
            event: event,
            flagTeam: flagTeam,
            playerTeam: playerTeam,
            player: playerNick
        })

        let clientComponent = this.controller.world.getComponent(RoomClientComponent)
        if (!clientComponent) return

        let flagColor = TeamColor.getColor(flagTeam).toChatColor(true)

        if (pilot) {
            let playerColor = TeamColor.getColor(playerTeam).toChatColor(true)
            let localizedEvent = localizedCTFFlagEventTypes[event]

            let message =
                `${playerColor}${playerNick} ` +
                `§!; ${localizedEvent} ` +
                `${flagColor}флаг ${TeamColor.teamNames[flagTeam]}`
            
            this.controller.world.emit("chat", message)
        } else if (event == CTFFlagEventType.flagReturn) {
            let message =
                `${flagColor}флаг ${TeamColor.teamNames[flagTeam]} возвращён на базу`

            this.controller.world.emit("chat", message)
        }
    }

    private onFlagDelivered(flagState: FlagStateComponent, tank: Entity) {
        const pilot = this.getTankPilot(tank)
        if (pilot) this.scorePlayer(pilot, 25)
        this.broadcastFlagEvent(CTFFlagEventType.flagDeliver, flagState.team.id, pilot)
    }

    private onFlagDrop(flagState: FlagStateComponent, tank: Entity) {
        const pilot = this.getTankPilot(tank)
        this.broadcastFlagEvent(CTFFlagEventType.flagDrop, flagState.team.id, pilot)
    }

    private onFlagCapture(flagState: FlagStateComponent, tank: Entity) {
        const pilot = this.getTankPilot(tank)
        this.broadcastFlagEvent(CTFFlagEventType.flagCapture, flagState.team.id, pilot)
    }

    private onFlagReturn(flagState: FlagStateComponent, tank: Entity) {
        const pilot = this.getTankPilot(tank)
        if (pilot) this.scorePlayer(pilot, 2)
        this.broadcastFlagEvent(CTFFlagEventType.flagReturn, flagState.team.id, pilot)
    }
}