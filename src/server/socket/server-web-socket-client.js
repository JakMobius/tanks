
const WebSocketClient = require("websocket").client;
const AbstractClient = require("../../networking/abstract-client")
const Logger = require("../log/logger")
const WebSocketConnection = require("websocket").connection;
const ServerWebSocketClientConnection = require("./server-web-socket-client-connection")

// Since `WebSocketClient` name is reserved by websocket module,
// this class is named like this

/**
 * This class implements a websocket client on Node.js side
 */
class ServerWebSocketClient extends AbstractClient {

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

    createConnection() {
        return new ServerWebSocketClientConnection(this)
    }

    connectToServer() {
        if(this.client != null) return;
        this.reconnect = true

        this.client = new WebSocketClient()

        this.client.on("connectFailed", (error) => this.onError(error))
        this.client.on("connect", (connection) => {
            this.webSocketConnection = connection

            this.onOpen()

            connection.on('error', (code, reason) => this.onError(code, reason));
            connection.on('close', (code, reason) => this.onClose(code, reason));
            connection.on('message', (message) => this.onMessage(message));
        })

        this.client.connect(this.config.ip)
    }

    onMessage(message) {
        try {
            if(message.type !== "binary") {
                Logger.global.log("Received invalid packet")
                Logger.global.log("Binary message expected, " + message.type + " received.")
                return
            }

            super.onData(new Uint8Array(message.binaryData).buffer);
        } catch(e) {
            Logger.global.log("Exception while handling packet")
            Logger.global.log(e)
        }
    }

    isConnecting() {
        return !!this.client
    }

    isOpen() {
        return !!this.webSocketConnection
    }

    writePacket(packet) {
        this.webSocketConnection.sendBytes(Buffer.from(packet))
    }

    disconnect(reason) {
        this.reconnect = false
        super.disconnect(reason)
        this.closeConnection(reason)
    }

    closeConnection(reason) {
        if(this.webSocketConnection) this.webSocketConnection.close(WebSocketConnection.CLOSE_REASON_NORMAL, reason)
        if(this.client) this.client.abort()
    }
}

module.exports = ServerWebSocketClient