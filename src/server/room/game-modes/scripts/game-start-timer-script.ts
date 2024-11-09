import ServerGameController from "src/server/room/game-modes/server-game-controller";
import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import Entity from "src/utils/ecs/entity";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import TimerComponent from "src/entity/components/network/timer/timer-component";

export default class GameStartTimerScript extends ServerGameScript {
    gameStartTimer: Entity;
    timerStarted: boolean
    private delay: number

    constructor(controller: ServerGameController, delay: number, callback: () => void) {
        super(controller)

        this.delay = delay
        this.gameStartTimer = new Entity()
        ServerEntityPrefabs.types.get(EntityType.TIMER_ENTITY)(this.gameStartTimer)
        this.gameStartTimer.on("timer-finished", callback)
    }

    activate() {
        super.activate();
        this.controller.world.appendChild(this.gameStartTimer)
    }

    deactivate() {
        super.deactivate();
        this.gameStartTimer.removeFromParent()
    }

    setTimerStarted(started: boolean) {
        if(started) {
            return this.startTimer()
        } else {
            return this.stopTimer()
        }
    }

    startTimer() {
        if(this.timerStarted) return false
        this.timerStarted = true
        this.gameStartTimer.getComponent(TimerComponent).countdownFrom(this.delay)
        return true
    }

    stopTimer() {
        if(!this.timerStarted) return false
        this.timerStarted = false
        this.gameStartTimer.getComponent(TimerComponent).countdownFrom(0)
        return true
    }
}