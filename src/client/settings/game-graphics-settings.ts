
export interface SerializedGameGraphicsSettings {

}

export default class GameGraphicsSettings {


    constructor(serialized?: SerializedGameGraphicsSettings) {
        if(!serialized) {
            serialized = {}
        }

    }

    serialize(): SerializedGameGraphicsSettings {
        return {

        }
    }
}