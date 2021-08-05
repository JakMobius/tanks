import BinaryPacket from "./binary-packet";
import EventEmitter from "../utils/eventemitter";

export default abstract class AbstractConnection extends EventEmitter {
    abstract isReady(): boolean

    abstract send(bytes: BinaryPacket): void

    abstract close(reason?: string): void

    abstract getIpAddress(): string

    receivePacket(packet: BinaryPacket) { this.emit("packet", packet) }
}