
import ServerGameStateController from "src/server/room/game-modes/server-game-state-controller";
import RaceController from "./race-controller";
import { CheckpointRespawnScript } from "./checkpoint-respawn-script";
import { RaceGameEvent, RaceGamePlayingState, RaceGameState, RaceGameStateType, RaceGameStateWaitingForPlayers } from "../race-game-state";
import Entity from "src/utils/ecs/entity";
import { PlayerRaceStateComponent } from "./player-race-state-component";
import ServerCheckpointComponent from "../../checkpoint/server-side/server-checkpoint-component";
import { RaceCheckpointsComponent } from "./game-checkpoints-component";
import PlayerNickComponent from "../../player/server-side/player-nick-component";
import { formatTimeMinSecMil } from "src/utils/utils";
import EntityDamageEvent from "src/events/tank-damage-event";
import { DamageTypes } from "src/server/damage-reason/damage-reason";
import GameStartTimerScript from "src/server/room/game-modes/scripts/game-start-timer-script";
import PlayerRespawnActionComponent from "../../player/server-side/player-respawn-action-component";
import PlayerTankControlComponent from "../../player/server-side/player-tank-control-component";
import PhysicalHostComponent from "src/entity/components/physical-host-component";
import PlayerTankComponent from "../../player/server-side/player-tank-component";
import PhysicalComponent from "src/entity/components/physics-component";
import * as Box2D from "@box2d/core"

export class RacePlayingStateController extends ServerGameStateController<RaceController, RaceGameState, RaceGameEvent> {

    physicsTicks: number = 0

    waitingPlayers = new Set<Entity>()
    playersGassing: number = 0

    constructor(controller: RaceController) {
        super(controller)
        this.addScript(new CheckpointRespawnScript(this.controller))

        this.addScript(new GameStartTimerScript(controller, 3, () => {
            this.releasePlayers()
        }))

        this.worldEventHandler.on("player-checkpoint-pass", (player, checkpoint) => this.onPlayerCheckpointPass(player, checkpoint))
        this.worldEventHandler.on("physics-tick", () => this.onPhysicsTick())
        this.worldEventHandler.on("physics-tick", () => this.onTick())
        this.worldEventHandler.on("entity-damage", (event: EntityDamageEvent) => this.onEntityDamage(event))
        this.worldEventHandler.on("player-connect", (player: Entity) => this.onPlayerConnect(player))
    }

    onPhysicsTick() {
        this.physicsTicks++

        for(let player of this.waitingPlayers) {
            let tank = player.getComponent(PlayerTankComponent)?.tank
            let physicsComponent = tank?.getComponent(PhysicalComponent)
            let body = physicsComponent?.getBody()
            body?.SetLinearVelocity(Box2D.b2Vec2.ZERO)
            body?.SetAngularVelocity(0)
        }
    }

    onTick() {
        this.updateThrottles()
    }

    activate(): void {
        this.physicsTicks = 0
        super.activate()
        for(let player of this.controller.players) this.resetPlayer(player)
    }

    resetPlayer(player: Entity) {
        player.getComponent(PlayerRaceStateComponent).lastCheckpointIndex = null
        player.getComponent(PlayerRespawnActionComponent).performRespawnAction()
    }

    releasePlayers() {
        for(let player of this.waitingPlayers) {
            let state = player.getComponent(PlayerRaceStateComponent)
            state.lastCheckpointIndex = -1
            state.startTicks = this.physicsTicks
            this.controller.triggerStateBroadcast(player)
        }
        this.waitingPlayers.clear()
    }

    isGassing(player: Entity) {
        let controls = player.getComponent(PlayerTankControlComponent)
        let throttle = controls?.throttleAxle?.getValue() ?? 0
        return Math.abs(throttle) > 0.5
    }

    updateThrottles() {
        this.playersGassing = 0

        for(let player of this.waitingPlayers) {
            if(this.isGassing(player)) this.playersGassing++
        }

        let allPlayersThrottle = this.playersGassing === this.waitingPlayers.size

        if(this.getScript(GameStartTimerScript).setTimerStarted(allPlayersThrottle)) {
            for(let player of this.waitingPlayers) {
                this.controller.triggerStateBroadcast(player)
            }
        }
    }

    onPlayerConnect(player: Entity): any {
        this.waitingPlayers.add(player)
        this.resetPlayer(player)
    }

    private onEntityDamage(event: EntityDamageEvent) {
        if(event.damageReason.damageType == DamageTypes.SELF_DESTRUCT) {
            return
        }
        event.cancel()
    }

    onPlayerCheckpointPass(player: Entity, checkpointEntity: Entity) {
        let playerState = player.getComponent(PlayerRaceStateComponent)
        let checkpoint = checkpointEntity.getComponent(ServerCheckpointComponent)
        let checkpointsController = this.controller.entity.getComponent(RaceCheckpointsComponent)
        let physicsHost = this.controller.world.getComponent(PhysicalHostComponent)

        let time = (this.physicsTicks - playerState.startTicks) * physicsHost.physicsTick

        this.sendEvent({
            checkpoint: checkpoint.index,
            totalCheckpoints: checkpointsController.checkpoints.length,
            time: time
        }, player)

        let nick = player.getComponent(PlayerNickComponent).nick ?? "unnamed"
        console.log("[ race ] " + 
            nick + " " + checkpoint.index + " / " + checkpointsController.checkpoints.length + ": " + 
            formatTimeMinSecMil(time))
    }

    getState(player: Entity) {
        if(this.waitingPlayers.has(player)) {
            return {
                state: RaceGameStateType.waitingForStart,
                isGassing: this.isGassing(player),
                timer: this.getScript(GameStartTimerScript).gameStartTimer,
                playersGassing: this.playersGassing,
                playersTotal: this.waitingPlayers.size
            } as RaceGameStateWaitingForPlayers
        } else {
            return {
                state: RaceGameStateType.playing,
            } as RaceGamePlayingState
        }
    }
}