import {CTFGameStateWaitingForPlayers} from "src/entity/types/controller-ctf/ctf-game-data";
import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";
import TimerComponent from "src/entity/components/network/timer/timer-component";
import GameStateView from "src/client/ui/overlay/game-overlay/game-state-view";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import CTFGameStateOverlay from "src/client/ui/overlay/game-overlay/ctf-game-overlay/ctf-game-state-overlay";

export default class CTFWaitingStateView extends GameStateView {
    state: CTFGameStateWaitingForPlayers
    timerEventHandler = new BasicEventHandlerSet()
    private updateOnTimer = false

    constructor(overlay: CTFGameStateOverlay) {
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

    setData(state: CTFGameStateWaitingForPlayers) {
        this.state = state
        this.update()
    }

    update() {
        // TODO: Do not rely on the world statistics component
        let worldStatistics = this.overlay.world.getComponent(WorldStatisticsComponent)
        let currentPlayerCount = this.state.currentPlayers
        let requiredPlayerCount = this.state.minPlayers

        if(currentPlayerCount < requiredPlayerCount) {
            let playerCountSpan = $("<span>").addClass("player-count").text(currentPlayerCount + "/" + requiredPlayerCount)
            this.header.empty()
            this.header.append("Ожидание игроков ", playerCountSpan)
        } else {
            this.timerEventHandler.setTarget(this.state.timer)
            this.header.empty()
            this.header.append("Игра начнется через " + this.state.timer.getComponent(TimerComponent).getMSTimeString())
            this.updateOnTimer = true
        }

        this.text.text(worldStatistics.mapName)
        this.show()
    }
}