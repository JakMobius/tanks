
const AbstractConnection = require("../networking/abstract-connection")

class WebsocketConnection extends AbstractConnection {
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

    close() {
        this.websocket.close()
    }
}

module.exports = WebsocketConnection