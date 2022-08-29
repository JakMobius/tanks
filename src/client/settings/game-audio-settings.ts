
export interface SerializedGameAudioSettings {

}

export default class GameAudioSettings {


    constructor(serialized?: SerializedGameAudioSettings) {
        if(!serialized) {
            serialized = {}
        }

    }

    serialize(): SerializedGameAudioSettings {
        return {

        }
    }
}