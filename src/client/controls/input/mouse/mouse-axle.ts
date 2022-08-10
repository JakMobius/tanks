import Axle from "../../../../controls/axle";
import {AxleConfig} from "../input-device";
import MouseListener from "./mouse-listener";

export enum MouseAxisDirection {
    x,
    y,
    wheelX,
    wheelY
}

export interface MouseAxleConfig extends AxleConfig {
    axis: MouseAxisDirection;
}

export default class MouseAxle extends Axle {
    constructor(listener: MouseListener, config: MouseAxleConfig) {
        super();
    }
}