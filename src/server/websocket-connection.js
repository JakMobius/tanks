
const AbstractConnection = require("../networking/abstract-connection")
const WebSocket = require("websocket")
const WebSocketConnection = WebSocket.connection
const Logger = require("./log/logger");

class WebsocketConnection extends AbstractConnection {

    /**
     * @type {WebSocketConnection}
     */
    websocket = null

    constructor(websocket) {
        super();
        this.websocket = websocket
    }

    isReady() {
        return this.websocket.state === "open"
    }

    send(packet) {
        this.websocket.sendBytes(Buffer.from(packet.getData()))
    }

    close(reason) {
        this.websocket.close(WebSocketConnection.CLOSE_REASON_NORMAL, reason)
    }
}

module.exports = WebsocketConnection