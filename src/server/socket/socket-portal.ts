import SocketPortalClient from '../socket/socket-portal-client';
import BinaryPacket from '../../networking/binary-packet';
import Logger from '../log/logger';
import WebsocketConnection from '../websocket-connection';
import * as Websocket from 'websocket'

/**
 * This class represents a specific socket portal.
 * One WebSocket instance can redirect its connections for different
 * socket portals. When new connection request is received,
 * {@link handleRequest} function is called. It decides
 * if specific socket portal should handle this connection or not.
 */
export default abstract class SocketPortal<ClientDataClass = any> {
	public dynamicConnectionHandler: (request: Websocket.request) => void;
	public webSocketServer: Websocket.server;

    /**
     * Clients of this portal
     */
    public clients = new Map<number, SocketPortalClient<ClientDataClass>>()

    /**
     * List of IPs blocked from connecting to this portal
     */
    public banned: string[] = []

    protected logger = new Logger()

    protected constructor() {

        this.dynamicConnectionHandler = (request: Websocket.request) => {
            this.handleRequest(request)
        }
    }

    /**
     * Disconnects all portal clients and unbinds
     * portal from WebSocket server
     */
    terminate() {
        for (let client of this.clients.values()) {
            client.connection.close()
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
        this.allowRequest(request)
    }

    allowRequest(request: Websocket.request) {
        return new WebsocketConnection(request.accept(null, request.origin))
    }

    // noinspection JSValidateJSDoc
    /**
     * This method is called up when this socket instance handles and
     * permits the connection to the socket.
     */

    setupClient(client: SocketPortalClient<ClientDataClass>) {
        this.clientConnected(client)
        this.clients.set(client.id, client)

        client.connection.on('incoming-packet', (packet: BinaryPacket) => {
            this.handlePacket(packet, client)
        })

        client.connection.on('close', () =>  {
            this.clientDisconnected(client)
            this.clients.delete(client.id);
        });

        client.connection.on('error', (e) => {
            this.logger.log("Error occurred in WebsocketConnection for client " + client.id)
            this.logger.log(e)
        })
    }

    /**
     * Called when client sends packet
     * @param packet {BinaryPacket} Received packet
     * @param client {SocketPortalClient} Packet sender
     */
    handlePacket(packet: BinaryPacket, client: SocketPortalClient<ClientDataClass>) {

    }

    /**
     * Called when client disconnects from the socket
     * @param client {SocketPortalClient}
     */
    clientDisconnected(client: SocketPortalClient<ClientDataClass>) {

    }

    /**
     * Called when new client connects to the socket*
     * @param client {SocketPortalClient}
     */
    clientConnected(client: SocketPortalClient<ClientDataClass>) {

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
