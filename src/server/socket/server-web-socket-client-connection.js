
const ClientConnection = require("../../networking/client-connection")

class ServerWebSocketClientConnection extends ClientConnection {
    close(reason) {
        // Calling `closeConnection` instead of `disconnect` here because
        // `disconnect` method prevents client from reconnecting again. We
        // should always try to reconnect to hub in the event that an error
        // occurs that causes the connection to be closed.

        this.client.closeConnection(reason)
    }
}

module.exports = ServerWebSocketClientConnection