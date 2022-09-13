import ButtonAxle, {ButtonAxleConfig} from "src/client/controls/interact/button-axle";
import MouseListener from "./mouse-listener";

export interface MouseButtonConfig extends ButtonAxleConfig {
    buttonIndex: number;
}

export default class MouseButtonAxle extends ButtonAxle {
    constructor(listener: MouseListener, config: MouseButtonConfig) {
        super(config);
    }
}