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

    private needsSave = false

    constructor(serialized?: SerializedGameSettings) {
        serialized = Object.assign({
            graphics: {},
            controls: {},
            audio:    {}
        }, serialized)

        this.graphics = new GameGraphicsSettings(serialized.graphics)
        this.controls = new GameControlsSettings(serialized.controls)
        this.audio    = new GameAudioSettings   (serialized.audio)

        this.graphics.on("update", () => this.update())
        this.controls.on("update", () => this.update())
        this.audio   .on("update", () => this.update())
    }

    update() {
        this.needsSave = true
    }

    saveIfNeeded() {
        if(this.needsSave) {
            this.save()
        }
    }

    save() {
        localStorage.setItem("game-settings", JSON.stringify(this.serialize()))
        this.needsSave = false
    }

    public static getInstance(): GameSettings {
        if(!GameSettings.instance) {
            const configString = localStorage.getItem("game-settings")
            let config: SerializedGameSettings = {}
            if(configString) {
                try {
                    config = JSON.parse(configString)
                } catch(e) {
                    console.error(e)
                }
            }
            GameSettings.instance = new GameSettings(config)
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