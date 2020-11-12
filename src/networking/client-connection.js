
const AbstractConnection = require("./abstract-connection")

class ClientConnection extends AbstractConnection {
    /**
     * @param client {AbstractClient}
     */
    constructor(client) {
        super();
        this.client = client
    }

    isReady() {
        // We can send messages when client is opening
        // because packets will be enqueued in this
        // case.
        return this.client.isOpen() || this.client.isConnecting();
    }

    send(packet) {
        this.client.sendPacket(packet)
    }

    close(reason) {
        this.client.disconnect(reason)
    }
}

module.exports = ClientConnection