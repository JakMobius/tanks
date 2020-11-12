const BinaryPacket = require("./binarypacket")
const ClientConnection = require("./client-connection")

class AbstractClient {

    /**
     * @type {AbstractConnection}
     */
    connection

    constructor(config) {
        this.config = config
        this.listeners = new Map()
        this.connection = this.createConnection()
        this.queue = []
    }

    /**
     * @returns {AbstractConnection}
     */
    createConnection() {
        return new ClientConnection(this)
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

    /**
     * @abstract
     */
    connectToServer() {

    }

    onOpen() {
        this.connected = true

        for(let packet of this.queue) this.writePacket(packet)

        this.queue = []

        this.emit("open")
    }

    /**
     * @param buffer {ArrayBuffer}
     */
    onData(buffer) {
        let decoder = BinaryPacket.binaryDecoder
        decoder.reset()
        decoder.readData(buffer)
        let packet = BinaryPacket.deserialize(decoder, BinaryPacket)
        if (packet) {
            this.handlePacket(packet)
        } else {
            //decoder.reset()
            //console.warn("Unknown packet type: " + decoder.readUint16())
        }
    }

    handlePacket(packet) {
        for (let [clazz, listeners] of this.listeners) {
            if (clazz instanceof Function && packet.constructor === clazz) {
                for (let listener of listeners) {
                    listener(packet)
                }
            }
        }
    }


    onError(code, reason) {
        this.emit("error", code, reason)
        this.connected = false
    }

    onClose(code, reason) {
        this.emit("close", code, reason)
        this.connected = false
    }

    /**
     * @abstract
     * @returns {boolean}
     */
    isOpen() {

    }

    /**
     * @abstract
     * @returns {boolean}
     */
    isConnecting() {

    }

    sendPacket(packet) {
        if(this.isOpen()) {
            this.writePacket(packet.getData())
        } else if(this.isConnecting()) {
            this.queue.push(packet)
        }
    }

    /**
     * @abstract
     * @protected
     * @param {ArrayBuffer} data
     */
    writePacket(data) {

    }

    /**
     * @abstract
     * Disconnect socket from server
     */
    disconnect() {

    }
}

module.exports = AbstractClient