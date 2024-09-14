import {
    CTFEventData,
    CTFFlagEventType,
    CTFGamePlayingState,
    localizedCTFFlagEventTypes
} from "src/entity/types/controller-ctf/ctf-game-data";
import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";
import GameStateView from "src/client/ui/overlay/game-overlay/game-state-view";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import CTFGameStateOverlay from "src/client/ui/overlay/game-overlay/ctf-game-overlay/ctf-game-state-overlay";
import TeamColor from "src/utils/team-color";

export default class CTFPlayingStateView extends GameStateView {
    state: CTFGamePlayingState
    private timerEventHandler = new BasicEventHandlerSet()
    private updateOnTimer: boolean = false
    private oldTimerValue = 0

    private matchTimeMessageTimer: number | null = null
    private matchTimeMessage: string | null = null

    private flagEventTimer: number | null = null
    private flagEvent: CTFEventData | null = null

    constructor(overlay: CTFGameStateOverlay) {
        super(overlay);

        this.timerEventHandler.on("timer-transmit", () => {
            this.onTimerSecond()
        })
    }

    onAttach() {
        super.onAttach();
        this.timerEventHandler.setTarget(this.overlay.world.getComponent(WorldStatisticsComponent).matchTimeLeftTimer)
    }

    onDetach() {
        super.onDetach();
        this.timerEventHandler.setTarget(null)
    }

    setData(state: CTFGamePlayingState) {
        this.state = state
        this.update()
    }

    handleFlagEvent(event: CTFEventData | null) {
        if (this.flagEventTimer) {
            clearInterval(this.flagEventTimer)
            this.flagEventTimer = null
        }

        this.flagEvent = event
        this.update()

        this.flagEventTimer = window.setTimeout(() => {
            this.handleFlagEvent(null)
        }, 2000)
    }

    private renderFlagEvent() {
        this.header.empty()
        this.text.hide()

        if (this.flagEvent.player) {
            this.header.append(
                $("<span>")
                    .css("color", TeamColor.getColor(this.flagEvent.playerTeam).code())
                    .text(this.flagEvent.player),
                $("<span>")
                    .text(" " + localizedCTFFlagEventTypes[this.flagEvent.event] + " "),
                $("<span>")
                    .css("color", TeamColor.getColor(this.flagEvent.flagTeam).code())
                    .text("флаг " + TeamColor.teamNames[this.flagEvent.flagTeam])
            )
        } else if (this.flagEvent.event === CTFFlagEventType.flagReturn) {
            this.header.append(
                $("<span>")
                    .css("color", TeamColor.getColor(this.flagEvent.flagTeam).code())
                    .text("флаг " + TeamColor.teamNames[this.flagEvent.flagTeam]),
                $("<span>")
                    .text(" возвращён на базу")
            )
        }

        this.show()
    }

    private renderQuickMatchEndEvent() {
        let worldStatistics = this.overlay.world.getComponent(WorldStatisticsComponent)
        let timer = worldStatistics.getMatchLeftTimerComponent()

        this.header.text("Нет соперников")
        this.text.show().text("Матч будет завершен через " + timer.getMSTimeString())
        this.updateOnTimer = true
        this.show()
    }

    private renderMatchTimeMessage() {
        this.header.text(this.matchTimeMessage)
        this.text.hide()
        this.show()
    }

    private update() {
        if (this.flagEvent) {
            this.renderFlagEvent()
        } else if (this.state.quickMatchEnd) {
            this.renderQuickMatchEndEvent()
        } else if (this.matchTimeMessage) {
            this.renderMatchTimeMessage()
        } else {
            this.hide()
        }
    }

    private showTimeLeft(message: string | null) {
        if (this.matchTimeMessageTimer) {
            clearInterval(this.matchTimeMessageTimer)
            this.matchTimeMessageTimer = null
        }

        this.matchTimeMessage = message
        this.update()

        if (message) {
            this.matchTimeMessageTimer = window.setTimeout(() => {
                this.showTimeLeft(null)
            }, 5000)
        }
    }

    private onTimerSecond() {
        if (this.updateOnTimer) {
            this.update()
        }

        let timer = this.overlay.world.getComponent(WorldStatisticsComponent).getMatchLeftTimerComponent()

        if (timer.currentTime < 300 && this.oldTimerValue >= 300) {
            this.showTimeLeft("5 минут до конца матча")
        } else if (timer.currentTime < 60 && this.oldTimerValue >= 60) {
            this.showTimeLeft("1 минута до конца матча")
        } else if (timer.currentTime < 30 && this.oldTimerValue >= 30) {
            this.showTimeLeft("30 секунд до конца матча")
        } else if (timer.currentTime < 10) {
            this.showTimeLeft("До конца матча осталось " + timer.getMSTimeString())
        }

        this.oldTimerValue = timer.currentTime
    }
}