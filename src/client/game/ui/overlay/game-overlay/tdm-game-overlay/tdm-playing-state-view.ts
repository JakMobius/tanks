
import {TDMGameStatePlaying} from "../../../../../../game-modes/tdm-game-state";
import WorldStatisticsComponent
    from "../../../../../../entity/components/network/world-statistics/world-statistics-component";
import GameStateView from "../game-state-view";
import BasicEventHandlerSet from "../../../../../../utils/basic-event-handler-set";
import TDMGameOverlay from "./tdm-game-overlay";

export default class TDMPlayingStateView extends GameStateView {
    state: TDMGameStatePlaying
    private timerEventHandler = new BasicEventHandlerSet()
    private updateOnTimer: boolean = false
    private oldTimerValue = 0
    private matchTimeMessageTimer: number | null = null
    private matchTimeMessage: string | null = null

    constructor(overlay: TDMGameOverlay) {
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

    setState(state: TDMGameStatePlaying) {
        this.state = state
        this.update()
    }

    private update() {
        if(this.state.quickMatchEnd) {
            let worldStatistics = this.overlay.world.getComponent(WorldStatisticsComponent)
            let timer = worldStatistics.getMatchLeftTimerComponent()

            this.header.text("Нет соперников")
            this.text.show().text("Матч будет завершен через " + timer.getTimeString())
            this.updateOnTimer = true
            this.show()
        } else if(this.matchTimeMessage) {
            this.header.text(this.matchTimeMessage)
            this.text.hide()
            this.show()
        } else {
            this.hide()
        }
    }

    private showTimeLeft(message: string | null) {
        if(this.matchTimeMessageTimer) {
            clearInterval(this.matchTimeMessageTimer)
        }

        this.matchTimeMessage = message
        this.update()

        if(message) {
            this.matchTimeMessageTimer = window.setTimeout(() => {
                this.matchTimeMessageTimer = null
                this.showTimeLeft(null)
            }, 5000)
        }
    }

    private onTimerSecond() {
        if(this.updateOnTimer) {
            this.update()
        }

        let timer = this.overlay.world.getComponent(WorldStatisticsComponent).getMatchLeftTimerComponent()

        if(timer.time < 300 && this.oldTimerValue >= 300) {
            this.showTimeLeft("5 минут до конца матча")
        } else if(timer.time < 60 && this.oldTimerValue >= 60) {
            this.showTimeLeft("1 минута до конца матча")
        } else if(timer.time < 30 && this.oldTimerValue >= 30) {
            this.showTimeLeft("30 секунд до конца матча")
        } else if(timer.time < 10) {
            this.showTimeLeft("До конца матча осталось " + timer.getTimeString())
        }

        this.oldTimerValue = timer.time
    }
}