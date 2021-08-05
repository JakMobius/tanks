import AbstractClient from "../../networking/abstract-client";
import BinaryPacket from "../../networking/binary-packet";
import Game from "../../server/room/game";
import SocketPortalClient from "../../server/socket/socket-portal-client";
import AbstractConnection from "../../networking/abstract-connection";
import {BinarySerializer} from "../../serialization/binary/serializable";
import {GameSocketPortalClient, GameSocketPortalClientData} from "../../server/socket/game-server/game-socket-portal";
import BinaryDecoder from "../../serialization/binary/binarydecoder";

export class EmbeddedServerConnection extends AbstractConnection {
    private embeddedServerClient: EmbeddedServerClient;

    constructor(embeddedServerClient: EmbeddedServerClient) {
        super();

        this.embeddedServerClient = embeddedServerClient
    }

    close(reason?: string): void {
        this.embeddedServerClient.disconnect()
    }

    isReady(): boolean {
        return true;
    }

    send(packet: BinaryPacket): void {
        //console.log("S -> C", packet)

        this.embeddedServerClient.handleData(packet.getData())
    }

    getIpAddress(): string {
        return "127.0.0.1";
    }
}

export default class EmbeddedServerClient extends AbstractClient {
    private socketPortalConnection: EmbeddedServerConnection
    private socketPortalClient: SocketPortalClient;
    protected connecting: boolean = false
    serverGame: Game

    constructor(serverGame: Game) {
        super();

        this.serverGame = serverGame

        this.socketPortalConnection = new EmbeddedServerConnection(this)
        this.socketPortalClient = new SocketPortalClient<GameSocketPortalClientData>({
            connection: this.socketPortalConnection,
            data: {
                player: null,
                listeningForRooms: false
            }
        })

        this.connection.on("packet", (packet) => this.handlePacket(packet))
    }

    connectToServer(): void {
        this.connecting = true
        this.serverGame.portal.clientConnected(this.socketPortalClient)
        this.connecting = false
        this.onOpen()
    }

    disconnect(): void {
        this.serverGame.portal.clientDisconnected(this.socketPortalClient)
        this.onClose(0, "Connection closed")
    }

    isConnecting(): boolean { return this.connecting; }
    isOpen(): boolean { return this.connected; }

    protected writePacket(packet: BinaryPacket): void {
        //console.log("C -> S", packet)
        this.serverGame.portal.receiveClientPacket(this.socketPortalClient, BinaryPacket.getTransmitted(packet))
    }

    getIpAddress(): string {
        return "127.0.0.1";
    }
}