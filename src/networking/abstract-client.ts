import BinaryPacket from './binarypacket';
import ClientConnection from './client-connection';
import AbstractConnection from "./abstract-connection";
import TypedEventHandler from "../utils/typed-event-handler";

export default abstract class AbstractClient extends TypedEventHandler {
    public queue: BinaryPacket[] = [];
    public connected: any;
    public connection: AbstractConnection

    protected constructor() {
        super()
        this.connection = this.createConnection()
    }

    createConnection(): AbstractConnection {
        return new ClientConnection(this)
    }

    onOpen() {
        this.connected = true
        this.flushQueue()
        this.emit("open")
    }

    onConnection() {
        this.onOpen()
    }

    handlePacket(packet: BinaryPacket) {
        this.emit(packet)
    }

    onError(error?: any) {
        this.emit("error", error)
        this.connected = false
    }

    onClose(code: number, reason?: string) {
        this.emit("close", code, reason)
        this.connected = false
    }

    sendPacket(packet: BinaryPacket) {
        if (this.isOpen()) {
            this.writePacket(packet)
        } else if (this.isConnecting()) {
            this.queue.push(packet)
        }
    }

    private flushQueue() {
        for (let packet of this.queue) {
            this.writePacket(packet)
        }

        this.queue = []
    }

    abstract connectToServer(): void
    abstract isOpen(): boolean
    abstract isConnecting(): boolean
    abstract disconnect(): void

    protected abstract writePacket(packet: BinaryPacket): void
}