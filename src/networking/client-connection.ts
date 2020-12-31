
import AbstractConnection from './abstract-connection';

class ClientConnection extends AbstractConnection {
	public client: any;

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

export default ClientConnection;