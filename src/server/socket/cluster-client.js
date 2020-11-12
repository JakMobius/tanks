
const ServerWebSocketClient = require("./server-web-socket-client");
const Logger = require("../log/logger")
const HandshakePacket = require("../../networking/packets/cluster-packets/handshake-packet")
const ClusterHandshake = require("./cluster-handshake")

class ClusterClient extends ServerWebSocketClient {

    /**
     * @type {string}
     */
    password

    /**
     * @type {boolean}
     */
    reconnect = false

    constructor(config) {
        super(config)

        this.on(HandshakePacket, (packet) => {
            Logger.global.log("Performing handshake")
            let salt = packet.handshakeData
            ClusterHandshake.createKey(this.password, salt, (error, key) => {

                if(error) {
                    // Something went wrong

                    this.connection.close("Failed to generate handshake key: " + error)
                } else {
                    // Sending back the generated handshake key
                    packet.handshakeData = new Uint8Array(key)
                    packet.sendTo(this.connection)
                }
            })
        })

        this.on("close", (code, reason) => {
            Logger.global.log("Connection to hub was closed: " + reason)

            this.reconnectDelayed()
        })

        this.on("error", (code, reason) => {
            Logger.global.log("Failed to connect to hub" + reason)

            this.reconnectDelayed()
        })
    }

    connectToServer() {
        Logger.global.log("Connecting to hub at " + this.config.ip)
        super.connectToServer()
    }

    onOpen() {
        super.onOpen();
        Logger.global.log("Successful connection, waiting for handshake request")
    }

    reconnectDelayed() {
        if(!this.reconnect) return
        this.webSocketConnection = null
        this.client = null

        setTimeout(() => {
            if(this.reconnect) this.connectToServer()
        }, this.reconnectionDelay);
    }

    isConnecting() {
        // Since we don't want to drop packets,
        // cluster client is always available to
        // enqueue them.
        return true
    }

    disconnect(reason) {
        this.reconnect = false
        super.disconnect(reason)
    }
}

module.exports = ClusterClient