import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";
import GameStateView from "src/client/ui/overlay/game-overlay/game-state-view";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import {DMGameStatePlaying} from "src/entity/types/controller-dm/dm-game-state";
import DMGameStateOverlay from "src/client/ui/overlay/game-overlay/dm-game-overlay/dm-game-state-overlay";

export default class DMPlayingStateView extends GameStateView {
    state: DMGameStatePlaying
    private timerEventHandler = new BasicEventHandlerSet()
    private updateOnTimer: boolean = false
    private oldTimerValue = 0
    private matchTimeMessageTimer: number | null = null
    private matchTimeMessage: string | null = null

    constructor(overlay: DMGameStateOverlay) {
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

    setState(state: DMGameStatePlaying) {
        this.state = state
        this.update()
    }

    private update() {
        if(this.state.quickMatchEnd) {
            let worldStatistics = this.overlay.world.getComponent(WorldStatisticsComponent)
            let timer = worldStatistics.getMatchLeftTimerComponent()

            this.header.text("Нет соперников")
            this.text.show().text("Матч будет завершен через " + timer.getMSTimeString())
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

        if(timer.currentTime < 300 && this.oldTimerValue >= 300) {
            this.showTimeLeft("5 минут до конца матча")
        } else if(timer.currentTime < 60 && this.oldTimerValue >= 60) {
            this.showTimeLeft("1 минута до конца матча")
        } else if(timer.currentTime < 30 && this.oldTimerValue >= 30) {
            this.showTimeLeft("30 секунд до конца матча")
        } else if(timer.currentTime < 10) {
            this.showTimeLeft("До конца матча осталось " + timer.getMSTimeString())
        }

        this.oldTimerValue = timer.currentTime
    }
}