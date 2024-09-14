import ButtonAxle, {ButtonAxleConfig} from '../../interact/button-axle';
import KeyboardListener from "./keyboard-listener";

export interface KeyAxleConfig extends ButtonAxleConfig {
    code: string
}

export default class KeyAxle extends ButtonAxle {
	public config: KeyAxleConfig;

    constructor(keyboard: KeyboardListener, config: KeyAxleConfig) {
        super(config)
        this.config = config

        const stoppedListeningHandler = () => { this.keyReleased(); }
        const keydownHandler = (event: KeyboardEvent) => {
            if(this.eventMatches(event)) {
                event.preventDefault()
                this.keyPressed()
            }
        }
        const keyupHandler = (event: KeyboardEvent) => {
            if(this.eventMatches(event)) {
                event.preventDefault()
                this.keyReleased()
            }
        }

        const clearAxlesHandler = () => {
            keyboard.off("keydown", keydownHandler)
            keyboard.off("keyup", keyupHandler)
            keyboard.off("stopped-listening", stoppedListeningHandler)
            keyboard.off("clear-axles", clearAxlesHandler)
            this.disconnectAll()
        }

        keyboard.on("keydown", keydownHandler)
        keyboard.on("keyup", keyupHandler)
        keyboard.on("stopped-listening", stoppedListeningHandler)
        keyboard.on("clear-axles", clearAxlesHandler)
    }

    private eventMatches(event: KeyboardEvent) {
        return event.code === this.config.code
    }
}