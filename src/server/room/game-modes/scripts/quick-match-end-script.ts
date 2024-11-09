import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import ServerGameController from "src/server/room/game-modes/server-game-controller";
import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";

export default class QuickMatchEndScript extends ServerGameScript {

    quickMatchEnd: boolean = false
    private savedMatchTime: number = 0
    private quickMatchEndTime: number

    constructor(controller: ServerGameController, quickMatchEndTime: number) {
        super(controller)
        this.quickMatchEndTime = quickMatchEndTime
    }

    setQuickMatchEnd(quick: boolean) {
        if(quick === this.quickMatchEnd) return false
        this.quickMatchEnd = quick

        let worldStatistics = this.controller.world.getComponent(WorldStatisticsComponent)
        let timer = worldStatistics.getMatchLeftTimerComponent()

        if(quick) {
            this.savedMatchTime = timer.currentTime
            if(timer.currentTime > this.quickMatchEndTime) {
                timer.countdownFrom(this.quickMatchEndTime)
            }
        } else {
            timer.countdownFrom(this.savedMatchTime)
        }

        return true
    }
}