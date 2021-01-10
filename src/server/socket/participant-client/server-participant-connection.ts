
import ClientConnection from '../../../networking/client-connection';
import ServerWebSocketClient from "../server-web-socket-client";

class ServerParticipantConnection extends ClientConnection {

    public client: ServerWebSocketClient;

    close(reason: string) {
        // Calling `closeConnection` instead of `disconnect` here because
        // `disconnect` method prevents client from reconnecting again. We
        // should always try to reconnect to hub in the event that an error
        // occurs that causes the connection to be closed.

        this.client.closeConnection(reason)
    }
}

export default ServerParticipantConnection;