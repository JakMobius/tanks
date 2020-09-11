
const BinaryPacket = require("../../networking/binarypacket")
const BinaryDecoder = require("../../serialization/binary/binarydecoder")

class Client {

    constructor(config) {
        this.config = config
        this.socket = null
        this.connected = false

        this.listeners = new Map()
        this.queue = []
    }

    on(what, handler) {
        if(this.listeners.has(what)) {
            this.listeners.get(what).push(handler)
        } else {
            this.listeners.set(what, [handler])
        }
    }

    emit(event) {
        let listeners = this.listeners.get(event)
        let args = Array.prototype.slice.call(arguments, 1)

        if(listeners) {
            for(let listener of listeners) {
                listener.apply(null, args)
            }
        }
    }

    connectToServer() {
        if(this.socket != null) throw new Error("Client object cannot be reused")

        this.socket = new WebSocket(this.config.ip);
        this.socket.binaryType = "arraybuffer"

        let self = this
        this.socket.onopen = (event) => self.onopen(event)
        this.socket.onclose = (event) => self.onclose(event)
        this.socket.onerror = (event) => self.onerror(event)
        this.socket.onmessage = (event) => self.onmessage(event)
    }

    onopen() {
        this.connected = true

        for(let packet of this.queue) {
            this.send(packet)
        }

        this.queue = []

        this.emit("open")
    }

    onmessage(event) {
        if(event.data instanceof ArrayBuffer) {
            let decoder = BinaryPacket.binaryDecoder
            decoder.reset()
            decoder.readData(event.data)
            let packet = BinaryPacket.deserialize(decoder, BinaryPacket)
            if (packet) {
                for (let [clazz, listeners] of this.listeners) {
                    if (clazz instanceof Function && packet.constructor === clazz) {
                        for (let listener of listeners) {
                            listener(packet)
                        }
                    }
                }
            } else {
                decoder.reset()
                console.warn("Unknown packet type: " + decoder.readUint16())
            }
        } else if(typeof event.data == "string") {
            this.emit("string", event.data)
        }
    }

    onerror(error) {
        this.emit("error", error)
        this.connected = false
    }

    onclose(event) {
        this.emit("close", event)
        this.connected = false
    }

    send(packet) {
        if(this.socket.readyState === WebSocket.OPEN) {
            if(packet instanceof BinaryPacket) {
                this.socket.send(packet.getData())
            } else if(typeof packet == "string") {
                this.socket.send(packet)
            }
        } else if(this.socket.readyState === WebSocket.CONNECTING) {
            this.queue.push(packet)
        }
    }
}

module.exports = Client