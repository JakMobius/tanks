import EventEmitter from "src/utils/event-emitter";

export interface SerializedGameGraphicsSettings {

}

export default class GameGraphicsSettings extends EventEmitter {


    constructor(serialized?: SerializedGameGraphicsSettings) {
        super()
        serialized = Object.assign({

        }, serialized)

    }

    serialize(): SerializedGameGraphicsSettings {
        return {

        }
    }
}