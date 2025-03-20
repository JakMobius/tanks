import ServerGameController from "src/server/room/game-modes/server-game-controller";
import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import {Constructor} from "src/utils/constructor"
import Entity from "src/utils/ecs/entity";

export default abstract class ServerGameStateController<
        ControllerClass extends ServerGameController = ServerGameController,
        StateClass = any,
        EventClass = any
    >  extends ServerGameScript<ControllerClass> {

    addScript(script: ServerGameScript) {
        this.scripts.push(script)
        if(this.active) {
            script.activate()
        }
    }

    getScript<T>(scriptClass: Constructor<T>): T {
        for(let script of this.scripts) {
            if(script instanceof scriptClass) {
                return script as any as T
            }
        }
        return null
    }

    activate() {
        super.activate();
        for(let script of this.scripts) {
            script.activate()
        }
    }

    deactivate() {
        super.deactivate();
        for(let script of this.scripts) {
            script.deactivate()
        }
    }

    sendEvent(event: EventClass, player?: Entity) {
        this.controller.sendEvent(event, player)
    }

    scripts: ServerGameScript[] = []
    abstract getState(player: Entity): StateClass
}