import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import ServerGameController from "src/server/room/game-modes/server-game-controller";

export default class DelayedActionScript extends ServerGameScript {

    private delay: number

    constructor(controller: ServerGameController, delay: number, callback: () => void) {
        super(controller)

        this.delay = delay

        this.worldEventHandler.on("tick", (dt) => {
            if(this.delay == 0) return
            this.delay -= dt
            if(this.delay <= 0) {
                callback()
            }
        })
    }

    setDelay(delay: number) {
        this.delay = delay
    }
}