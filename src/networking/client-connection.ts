
import AbstractConnection from './abstract-connection';
import AbstractClient from "./abstract-client";
import BinaryPacket from "./binary-packet";

export default class ClientConnection extends AbstractConnection {
	public client: AbstractClient;

    constructor(client: AbstractClient) {
        super();
        this.client = client
    }

    isReady() {
        // We can send messages when client is opening
        // because packets will be enqueued in this
        // case.
        return this.client.isOpen() || this.client.isConnecting();
    }

    send(packet: BinaryPacket) {
        this.client.sendPacket(packet)
    }

    close(reason: string) {
        this.client.disconnect()
    }

    getIpAddress(): string {
        return this.client.getIpAddress();
    }
}