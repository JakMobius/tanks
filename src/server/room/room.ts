import BinaryPacket from "../../networking/binarypacket";
import Server from "../server";
import SocketPortalClient from "../socket/socket-portal-client";
import {Class} from "../../utils/class";
import {Constructor} from "../../serialization/binary/serializable";

class Room {
	public maxOnline: number = 10;
    /// Map of clients, connected to this room.
    clients = new Map<Number, SocketPortalClient>()

    /// Event listener map
    listeners = new Map<string | Class<any>, Array<Function>>()

    /// Server associated with this room
    server: Server = null
    name: string = null
    
    public currentOnline: number = 0

    constructor() {
    }

    on<T>(what: Constructor<T>, handler: ((client: SocketPortalClient, packet: T) => void)): void
    on(what: string, handler: (() => void)): void
    on(what: Constructor<any> | string, handler: Function): void {
        if(this.listeners.has(what)) {
            this.listeners.get(what).push(handler)
        } else {
            this.listeners.set(what, [handler])
        }
    }

    clientConnected(client: SocketPortalClient) {
        this.clients.set(client.id, client)
        this.currentOnline++
    }

    clientDisconnected(client: SocketPortalClient) {
        this.clients.delete(client.id)
        this.currentOnline--
    }

    clientMessage(client: SocketPortalClient, packet: BinaryPacket) {
        for (let [clazz, listeners] of this.listeners.entries()) {
            if (clazz instanceof Function && packet.constructor === clazz) {
                for (let listener of listeners) {
                    listener(client, packet)
                }
            }
        }
    }

    emit(event: Class<any> | string, ...rest: any[]) {
        let listeners = this.listeners.get(event)
        let args = Array.prototype.slice.call(arguments, 1)

        if(listeners) {
            for(let listener of listeners) {
                listener.apply(this, args)
            }
        }
    }
}

export default Room;
