import ButtonAxle, {ButtonAxleConfig} from '../../interact/button-axle';
import KeyboardListener from "./keyboard-listener";

export interface KeyAxleConfig extends ButtonAxleConfig {
    key: string
}

export default class KeyAxle extends ButtonAxle {
	public key: string;

    constructor(keyboard: KeyboardListener, config: KeyAxleConfig) {
        super(config)
        this.key = config.key

        const stoppedListeningHandler = () => { this.keyReleased(); }
        const keydownHandler = (event: KeyboardEvent) => { if(event.code === this.key) this.keyPressed() }
        const keyupHandler   = (event: KeyboardEvent) => { if(event.code === this.key) this.keyReleased() }
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
}