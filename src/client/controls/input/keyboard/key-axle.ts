import ButtonAxle, {ButtonAxleConfig} from '../../interact/button-axle';
import KeyboardListener from "./keyboard-listener";
import {isMacOS} from "../../../../utils/meta-key-name";

export interface KeyAxleConfig extends ButtonAxleConfig {
    key: string
}

export default class KeyAxle extends ButtonAxle {
	public config: KeyAxleConfig;

    constructor(keyboard: KeyboardListener, config: KeyAxleConfig) {
        super(config)
        this.config = config

        const stoppedListeningHandler = () => { this.keyReleased(); }
        const keydownHandler = (event: KeyboardEvent) => {
            if(event.code === this.config.key) {
                event.preventDefault()
                this.keyPressed()
            }
        }
        const keyupHandler = (event: KeyboardEvent) => {
            if(event.code === this.config.key) {
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
}