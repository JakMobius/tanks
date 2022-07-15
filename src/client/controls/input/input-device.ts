import Axle from "../../../controls/axle";

export enum InputDeviceType {
    keyboard,
    mouse,
    gamepad
}

export interface AxleConfig {
    [key: string]: any
}

export default abstract class InputDevice {

    protected constructor() {}

    abstract getType(): InputDeviceType;
    abstract getName(): string;
    abstract createAxle(config: AxleConfig): Axle;
    abstract clearAxles(): void;
}