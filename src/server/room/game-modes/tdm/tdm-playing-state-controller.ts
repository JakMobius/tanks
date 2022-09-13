import TDMGameStateController from "./tdm-game-state-controller";
import ServerTDMControllerComponent from "./server-tdm-controller-component";
import TilemapComponent from "src/physics/tilemap-component";
import PlayerRespawnEvent from "src/events/player-respawn-event";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";
import EntityDamageEvent from "src/events/tank-damage-event";
import ServerEntityPilotListComponent from "src/server/entity/components/server-entity-pilot-list-component";
import PlayerConnectEvent from "src/events/player-connect-event";
import {TDMMatchOverStateController} from "./tdm-match-over-state-controller";
import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import {TDMGameState, TDMGameStateType} from "src/game-modes/tdm-game-state";
import WorldPlayerStatisticsComponent from "src/server/entity/components/world-player-statistics-component";
import Player from "src/server/player";
import {TDMPlayerWaitingStateController} from "./tdm-player-waiting-state";
import DamageRecorderComponent from "src/server/entity/components/damage-recorder-component";
import Team from "src/server/team";
import MapLoaderComponent from "src/server/room/components/map-loader-component";

export interface TDMTeamStatistics {
    team: number
    score: number
}

export class TDMPlayingStateController extends TDMGameStateController {

    timerEventHandler = new BasicEventHandlerSet()
    private savedMatchTime: number = 0
    private quickMatchEnd = false
    private teamStatistics = new Map<Team, TDMTeamStatistics>()
    private gameRunning = false;

    constructor(controller: ServerTDMControllerComponent) {
        super(controller)

        this.worldEventHandler.on("player-team-set", (event) => this.onPlayerTeamSet(event))
        this.worldEventHandler.on("player-connect", (event) => this.onPlayerConnect(event))
        this.worldEventHandler.on("player-respawn", (event) => this.onPlayerRespawn(event))
        this.worldEventHandler.on("entity-damage", (event) => this.onEntityDamage(event))
        this.worldEventHandler.on("player-death", (player) => this.onPlayerDeath(player))
        this.timerEventHandler.on("timer-finished", () => this.onMatchTimerExpired())
    }

    activate() {
        let worldStatistics = this.controller.world.getComponent(WorldStatisticsComponent)
        worldStatistics.getMatchLeftTimerComponent().setTime(this.controller.config.matchTime)
        this.timerEventHandler.setTarget(worldStatistics.matchTimeLeftTimer)
        this.controller.world.getComponent(WorldPlayerStatisticsComponent).resetAllStatistics()

        this.teamStatistics.clear()
        for(let team of this.controller.teams) {
            this.teamStatistics.set(team, {
                team: team.id,
                score: 0
            })
        }

        super.activate()
        this.assignTeams()
        this.controller.triggerStateBroadcast()
        this.controller.world.getComponent(MapLoaderComponent).reloadMap()

        this.gameRunning = true
    }

    deactivate() {
        super.deactivate()
        this.timerEventHandler.setTarget(null)
    }

    private onEntityDamage(event: EntityDamageEvent) {
        if (!event.damageReason.players) return

        let entity = event.entity
        let pilots = entity.getComponent(ServerEntityPilotListComponent)

        if (!pilots) return

        for (let player of pilots.players) {
            for (let damager of event.damageReason.players) {
                if (player.team == damager.team) {
                    event.cancel()
                    return
                }
            }
        }
    }

    private assignTeams() {
        let playerArray = this.controller.getWorld().getComponent(ServerWorldPlayerManagerComponent).players.slice()

        while (playerArray.length) {
            let randomPlayer = playerArray.splice(Math.floor(Math.random() * playerArray.length), 1)[0]
            if(randomPlayer.team == null) {
                randomPlayer.setTeam(this.controller.leastPopulatedTeam())
            }
            randomPlayer.respawn()
        }
    }

    private onPlayerRespawn(event: PlayerRespawnEvent) {
        const world = this.controller.getWorld()
        const map = world.getComponent(TilemapComponent).map
        const teams = this.controller.teams
        let index = teams.indexOf(event.player.team)
        if (index == -1) {
            index = Math.floor(Math.random() * map.spawnZones.length)
        }

        event.respawnPosition = map.spawnPointForTeam(index)
    }

    private onPlayerConnect(event: PlayerConnectEvent) {
        if (event.declined) return
        event.player.setTeam(this.controller.leastPopulatedTeam())
        this.setQuickMatchEnd(false)
    }

    private onMatchTimerExpired() {
        this.endMatch()
    }

    private onPlayerTeamSet(player: Player) {
        if(!this.gameRunning) return

        let teams = this.controller.teams
        let notEmptyTeams = 0

        for (let team of teams) {
            if (team.players.length) notEmptyTeams++
        }

        if (notEmptyTeams == 1) this.setQuickMatchEnd(true)
        if (notEmptyTeams == 0) this.abortMatch()
    }

    private onPlayerDeath(player: Player) {
        let damageRecorder = this.controller.world.getComponent(DamageRecorderComponent)

        let killer = damageRecorder.getDamageData(player).damagers[0]
        if(killer && killer != player) {
            this.scorePlayer(killer, 10)
        }
    }

    private setQuickMatchEnd(quick: boolean) {
        if(quick == this.quickMatchEnd) return
        this.quickMatchEnd = quick

        let worldStatistics = this.controller.world.getComponent(WorldStatisticsComponent)
        let timer = worldStatistics.getMatchLeftTimerComponent()

        if(quick) {
            this.savedMatchTime = timer.time
            if(timer.time > this.controller.config.singleTeamMatchTime) {
                timer.setTime(this.controller.config.singleTeamMatchTime)
            }
        } else {
            timer.setTime(this.savedMatchTime)
        }
        this.controller.triggerStateBroadcast()
    }

    private abortMatch() {
        this.controller.activateController(new TDMPlayerWaitingStateController(this.controller))
    }

    private endMatch() {
        let statistics = Array.from(this.teamStatistics.values())
        this.controller.activateController(new TDMMatchOverStateController(this.controller, statistics))
    }

    private scorePlayer(player: Player, score: number) {
        let statistics = this.controller.world.getComponent(WorldPlayerStatisticsComponent)
        statistics.scorePlayer(player, score)

        if(player.team) {
            let teamStatistics = this.teamStatistics.get(player.team)
            teamStatistics.score += score
        }
    }

    getState(): TDMGameState {
        return {
            state: TDMGameStateType.playing,
            quickMatchEnd: this.quickMatchEnd
        }
    }
}