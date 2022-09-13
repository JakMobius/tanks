
import {TDMGameStateWaitingForPlayers} from "src/game-modes/tdm-game-state";
import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";
import TimerComponent from "src/entity/components/network/timer/timer-component";
import GameStateView from "../game-state-view";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import TDMGameOverlay from "./tdm-game-overlay";

export default class TDMWaitingStateView extends GameStateView {
    state: TDMGameStateWaitingForPlayers
    timerEventHandler = new BasicEventHandlerSet()
    private updateOnTimer = false

    constructor(overlay: TDMGameOverlay) {
        super(overlay);

        this.timerEventHandler.on("timer-transmit", () => {
            if(this.updateOnTimer) {
                this.updateOnTimer = false
                this.update()
            }
        })
    }

    onAttach() {
        super.onAttach();
    }

    onDetach() {
        super.onDetach();
        this.timerEventHandler.setTarget(null)
    }

    setState(state: TDMGameStateWaitingForPlayers) {
        this.state = state
        this.update()
    }

    update() {
        // TODO: Do not rely on the world statistics component
        let worldStatistics = this.overlay.world.getComponent(WorldStatisticsComponent)
        let currentPlayerCount = worldStatistics.playerStatistics.length
        let requiredPlayerCount = this.state.minPlayers

        if(currentPlayerCount < requiredPlayerCount) {
            let playerCountSpan = $("<span>").addClass("player-count").text(currentPlayerCount + "/" + requiredPlayerCount)
            this.header.empty()
            this.header.append("Ожидание игроков ", playerCountSpan)
        } else {
            this.timerEventHandler.setTarget(this.state.timer)
            this.header.empty()
            this.header.append("Игра начнется через " + this.state.timer.getComponent(TimerComponent).getTimeString())
            this.updateOnTimer = true
        }

        this.text.text(worldStatistics.mapName)
        this.show()
    }
}