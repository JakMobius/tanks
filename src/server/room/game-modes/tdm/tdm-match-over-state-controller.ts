import TDMGameStateController from "./tdm-game-state-controller";
import ServerTDMControllerComponent from "./server-tdm-controller-component";
import {TDMGameState, TDMGameStateType} from "src/game-modes/tdm-game-state";
import EntityDamageEvent from "src/events/tank-damage-event";
import BlockDamageEvent from "src/events/block-damage-event";
import {TDMPlayerWaitingStateController} from "./tdm-player-waiting-state";
import {TDMTeamStatistics} from "./tdm-playing-state-controller";

export class TDMMatchOverStateController extends TDMGameStateController {

    private delay = 0
    private teamStatistics: TDMTeamStatistics[]

    constructor(controller: ServerTDMControllerComponent, statistics: TDMTeamStatistics[]) {
        super(controller)

        this.teamStatistics = statistics

        this.worldEventHandler.on("entity-damage", (event) => this.onEntityDamage(event))
        this.worldEventHandler.on("map-block-damage", (event) => this.onBlockDamage(event))
        this.worldEventHandler.on("tick", (dt) => this.onTick(dt))

        this.delay = controller.config.matchEndDelay
    }

    getState(): TDMGameState {
        return {
            state: TDMGameStateType.match_over,
            teamStatistics: this.teamStatistics
        }
    }

    private onEntityDamage(event: EntityDamageEvent) {
        event.cancel()
    }

    private onBlockDamage(event: BlockDamageEvent) {
        event.cancel()
    }

    private onTick(dt: number) {
        this.delay -= dt
        if(this.delay <= 0) {
            this.controller.activateController(new TDMPlayerWaitingStateController(this.controller))
        }
    }
}