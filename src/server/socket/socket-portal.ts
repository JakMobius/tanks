import SocketPortalClient from '../socket/socket-portal-client';
import BinaryPacket from '../../networking/binarypacket';
import Logger from '../log/logger';
import WebsocketConnection from '../websocket-connection';
import * as Websocket from 'websocket'
import {BinarySerializer} from "../../serialization/binary/serializable";

/**
 * This class represents a specific socket portal.
 * One WebSocket instance can redirect its connections for different
 * socket portals. When new connection request is received,
 * {@link handleRequest} function is called. It decides
 * if specific socket portal should handle this connection or not.
 */
class SocketPortal {
	public dynamicConnectionHandler: (request: Websocket.request) => void;
	public webSocketServer: Websocket.server;
    static clientClass = SocketPortalClient

    /**
     * Clients of exactly this portal
     */
    public clients = new Map<number, SocketPortalClient>()

    /**
     * List of IPs blocked for connecting to this portal
     */
    public banned: string[] = []

    protected logger = new Logger()

    constructor() {

        this.dynamicConnectionHandler = (request: Websocket.request) => this.handleRequest(request)
    }

    /**
     * Disconnects all portal clients and unbinds
     * portal from WebSocket server
     */
    terminate() {
        for (let client of this.clients.values()) {
            client.websocket.close()
        }
        this.webSocketServer.off('request', this.dynamicConnectionHandler)
    }

    // noinspection JSValidateJSDoc
    /**
     * This method decides whether to process, (accept or deny) the
     * connection request or ignore it so that it can be handled by
     * another socket instance. By default, all connection requests
     * are allowed. Overwrite this method if you wish only to process
     * exact request path or deny requests made from not-trusted
     * origin.
     */
    handleRequest(request: Websocket.request) {
        this.handleConnection(request.accept(null, request.origin));
    }

    // noinspection JSValidateJSDoc
    /**
     * This method is called up when this socket instance handles and
     * permits the connection to the socket.
     * @param connection {WebSocketConnection}
     */

    handleConnection(connection: Websocket.connection) {
        const client = new ((this.constructor as typeof SocketPortal).clientClass)({
            websocket: connection,
            connection: new WebsocketConnection(connection)
        });

        this.clients.set(client.id, client)

        client.websocket.on('message', (message: Websocket.IMessage) => {
            this.handleMessage(message, client)
        })

        client.websocket.on('close', () =>  {
            this.clientDisconnected(client)
            this.clients.delete(client.id);
        });

        this.clientConnected(client)
    }

    /**
     * This method is called when portal receives a message from
     * specific client
     */
    handleMessage(message: Websocket.IMessage, client: SocketPortalClient) {
        try {
            if(message.type !== "binary") {
                this.logger.log("Received invalid packet from client " + client.id)
                this.logger.log("Binary message expected, " + message.type + " received.")
                return
            }

            let data = message.binaryData
            let decoder = BinaryPacket.binaryDecoder
            decoder.reset()
            decoder.readData(new Uint8Array(data).buffer)

            // BinaryPacket.deserialize may only return
            // a BinaryPacket instance

            let packet = BinarySerializer.deserialize(decoder, BinaryPacket)

            this.handlePacket(packet, client);
        } catch(e) {
            this.logger.log("Exception while handling packet from client " + client.id)
            this.logger.log(e)
        }
    }

    /**
     * Called when client sends packet
     * @param packet {BinaryPacket} Received packet
     * @param client {SocketPortalClient} Packet sender
     */
    handlePacket(packet: BinaryPacket, client: SocketPortalClient) {

    }

    /**
     * Called when client disconnects from the socket
     * @param client {SocketPortalClient}
     */
    clientDisconnected(client: SocketPortalClient) {

    }

    /**
     * Called when new client connects to the socket*
     * @param client {SocketPortalClient}
     */
    clientConnected(client: SocketPortalClient) {

    }

    /**
     * Binds this socket instance to listen websocket
     * connections
     * @param webSocket
     */
    bindToWebsocket(webSocket: Websocket.server) {
        this.webSocketServer = webSocket
        this.webSocketServer.on('request', this.dynamicConnectionHandler)
    }
}

export default SocketPortal;
