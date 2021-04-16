import BinaryPacket from './binarypacket';
import ClientConnection from './client-connection';
import AbstractConnection from "./abstract-connection";
import {Class} from "../utils/class";
import SocketPortalClient from "../server/socket/socket-portal-client";
import {BinarySerializer, Constructor} from "../serialization/binary/serializable";

abstract class AbstractClient {
    public listeners = new Map<string | Constructor<any>, Array<Function>>();
    public queue: BinaryPacket[] = [];
    public connected: any;
    public connection: AbstractConnection

    protected constructor() {
        this.connection = this.createConnection()
    }

    createConnection(): AbstractConnection {
        return new ClientConnection(this)
    }

    on<T>(what: Constructor<T>, handler: ((packet: T) => void)): void
    on(what: string, handler: ((...args: any[]) => void)): void
    on(what: Constructor<any> | string, handler: Function): void {
        if (this.listeners.has(what)) {
            this.listeners.get(what).push(handler)
        } else {
            this.listeners.set(what, [handler])
        }
    }

    emit(event: string | Constructor<any>, ...rest: any[]) {
        let listeners = this.listeners.get(event)
        let args = Array.prototype.slice.call(arguments, 1)

        if (listeners) {
            for (let listener of listeners) {
                listener.apply(null, args)
            }
        }
    }

    abstract connectToServer(): void

    onOpen() {
        this.connected = true

        for (let packet of this.queue) this.writePacket(packet.getData())

        this.queue = []

        this.emit("open")
    }

    onConnection() {
        this.onOpen()
    }

    onData(buffer: ArrayBuffer) {
        let decoder = BinaryPacket.binaryDecoder
        decoder.reset()
        decoder.readData(buffer)
        let packet = BinarySerializer.deserialize(decoder, BinaryPacket)
        if (packet) {
            this.handlePacket(packet)
        } else {
            //decoder.reset()
            //console.warn("Unknown packet type: " + decoder.readUint16())
        }
    }

    handlePacket(packet: BinaryPacket) {
        for (let [clazz, listeners] of this.listeners) {
            if (clazz instanceof Function && packet.constructor === clazz) {
                for (let listener of listeners) {
                    listener(packet)
                }
            }
        }
    }


    onError(error?: any) {
        this.emit("error", error)
        this.connected = false
    }

    onClose(code: number, reason?: string) {
        this.emit("close", code, reason)
        this.connected = false
    }

    abstract isOpen(): boolean

    abstract isConnecting(): boolean

    sendPacket(packet: BinaryPacket) {
        if (this.isOpen()) {
            this.writePacket(packet.getData())
        } else if (this.isConnecting()) {
            this.queue.push(packet)
        }
    }

    protected abstract writePacket(data: ArrayBuffer): void

    abstract disconnect(): void
}

export default AbstractClient;