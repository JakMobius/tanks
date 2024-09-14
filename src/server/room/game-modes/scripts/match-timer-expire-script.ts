import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import ServerGameController from "src/server/room/game-modes/server-game-controller";
import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";

export default class MatchTimerExpireScript extends ServerGameScript {

    private timerEventHandler = new BasicEventHandlerSet()

    constructor(controller: ServerGameController, callback: () => void) {
        super(controller)

        this.timerEventHandler.on("timer-finished", callback)
    }

    activate() {
        let worldStatistics = this.controller.world.getComponent(WorldStatisticsComponent)
        this.timerEventHandler.setTarget(worldStatistics.matchTimeLeftTimer)
    }

    deactivate() {
        this.timerEventHandler.setTarget(null)
    }

}