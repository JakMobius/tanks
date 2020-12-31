


class Room {
	public maxOnline: any;
    /**
     * Map of clients, connected to this room.
     * @type {Map<Number,Client>}
     */
    clients = null

    /**
     * Event listener map
     * @type {Map<Number,Array<Function>>}
     */
    listeners = null

    /**
     * Server associated with this room
     * @type {Server}
     */
    server = null
    name = null

    constructor() {
        this.clients = new Map()
        this.listeners = new Map()
        this.server = null
        this.name = null
        this.maxOnline = 10
    }

    on(what, handler) {
        if(this.listeners.has(what)) {
            this.listeners.get(what).push(handler)
        } else {
            this.listeners.set(what, [handler])
        }
    }

    clientConnected(client) {
        this.clients.set(client.id, client)
    }

    clientDisconnected(client) {
        this.clients.delete(client.id)
    }

    clientMessage(client, packet) {
        for (let [clazz, listeners] of this.listeners.entries()) {
            if (clazz instanceof Function && packet.constructor === clazz) {
                for (let listener of listeners) {
                    listener(client, packet)
                }
            }
        }
    }

    emit(event) {
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
