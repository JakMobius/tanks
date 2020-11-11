
const WebSocketClient = require("websocket").client;
const AbstractClient = require("../../networking/abstract-client")
const Logger = require("../log/logger")
const BinaryPacket = require("../../networking/binarypacket")

class ClusterClient extends AbstractClient {

    /**
     * @type WebSocketClient
     */
    client

    constructor(config) {
        super(config)
        this.client = null
        this.webSocketConnection = null
        this.reconnect = false
        this.reconnectionDelay = 5000 // ms
    }

    connectToServer() {
        if(this.client != null) return;
        this.reconnect = true

        this.client = new WebSocketClient()

        this.client.on("connectFailed", (error) => this.reconnectDelayed())
        this.client.on("connect", (connection) => {
            this.webSocketConnection = connection

            connection.on('error', (error) => this.reconnectDelayed());
            connection.on('close', () => this.reconnectDelayed());
            connection.on('message', (message) => this.onData(message));
        })

        this.client.connect(this.config.ip)
    }

    reconnectDelayed() {
        if(!this.reconnect) return
        this.webSocketConnection = null
        this.client = null

        setTimeout(() => {
            if(this.reconnect) this.connectToServer()
        }, this.reconnectionDelay);
    }

    onData(message) {
        try {
            if(message.type !== "binary") {
                Logger.global.log("Received invalid packet from socket server")
                Logger.global.log("Binary message expected, " + message.type + " received.")
                return
            }

            let data = message.binaryData
            let decoder = BinaryPacket.binaryDecoder
            decoder.reset()
            decoder.readData(new Uint8Array(data).buffer)

            // BinaryPacket.deserialize may only return
            // a BinaryPacket instance

            // noinspection JSValidateTypes
            /** @type BinaryPacket */
            let packet = BinaryPacket.deserialize(decoder, BinaryPacket)

            this.handlePacket(packet);
        } catch(e) {
            Logger.global.error("Exception while handling packet from socket server")
            Logger.global.error(e)
        }
    }

    /**
     * Called when a message from cluster server is received
     * @param packet {BinaryPacket} Received packet
     */
    handlePacket(packet) {
        Logger.global.log("Received packet")
        Logger.global.log(packet)
    }

    onMessage(event) {
        if(event.type === "binary") {
            this.onData(event.binaryData.buffer)
        }
    }

    isConnecting() {
        // Since we don't want to drop packets,
        // cluster client is always available to
        // enqueue them.
        return true
    }

    isOpen() {
        return !!this.webSocketConnection
    }

    writePacket(packet) {
        this.webSocketConnection.sendBytes(Buffer.from(packet))
    }

    disconnect() {
        this.reconnect = false
        if(this.client) this.client.abort()
    }
}

module.exports = ClusterClient