import GameGraphicsSettings, {SerializedGameGraphicsSettings} from "./game-graphics-settings";
import GameControlsSettings, {SerializedGameControlsSettings} from "./game-controls-settings";
import GameAudioSettings, {SerializedGameAudioSettings} from "./game-audio-settings";

export interface SerializedGameSettings {
    graphics?: SerializedGameGraphicsSettings
    controls?: SerializedGameControlsSettings
    audio?:    SerializedGameAudioSettings
}

export default class GameSettings {
    private static instance: GameSettings;
    public graphics: GameGraphicsSettings
    public controls: GameControlsSettings
    public audio:    GameAudioSettings

    constructor(serialized?: SerializedGameSettings) {
        if(!serialized) {
            serialized = {}
        }

        this.graphics = new GameGraphicsSettings(serialized.graphics)
        this.controls = new GameControlsSettings(serialized.controls)
        this.audio    = new GameAudioSettings   (serialized.audio)
    }

    public static getInstance(): GameSettings {
        if(!GameSettings.instance) {
            GameSettings.instance = new GameSettings()
        }
        return GameSettings.instance
    }

    serialize(): SerializedGameSettings {
        return {
            graphics: this.graphics.serialize(),
            controls: this.controls.serialize(),
            audio:    this.audio.serialize()
        }
    }
}