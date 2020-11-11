const GameClient = require("../client")
const BinaryPacket = require("../../networking/binarypacket")
const Logger = require("../log/logger")
const WebsocketConnection = require("../websocket-connection")

/**
 * This class represents a specific socket portal.
 * One WebSocket instance can redirect its connections for different
 * socket portals. When new connection request is received,
 * {@link handleRequest} function is called. It decides
 * if specific socket portal should handle this connection or not.
 */
class SocketPortal {

    /**
     * Clients of exactly this portal
     * @type {Map<number, GameClient>}
     */
    clients = new Map()

    /**
     * List of IPs blocked for connecting to this portal
     * @type {string[]}
     */
    banned = []

    /**
     * @type {Logger}
     */
    logger = new Logger()

    constructor(config) {
        this.config = config || {}

        this.dynamicConnectionHandler = (request) => this.handleRequest(request)
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
     * @param request {WebSocketRequest}
     */
    handleRequest(request) {
        this.handleConnection(request.accept(null, request.origin));
    }

    // noinspection JSValidateJSDoc
    /**
     * This method is called up when this socket instance handles and
     * permits the connection to the socket.
     * @param connection {WebSocketConnection}
     */

    handleConnection(connection) {
        const client = new GameClient({
            websocket: connection,
            connection: new WebsocketConnection(connection)
        });

        this.clients.set(client.id, client)

        client.websocket.on('message', (message) => {
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
     * @param message {Object}
     * @param client {GameClient}
     */
    handleMessage(message, client) {
        try {
            if(message.type !== "binary") {
                Logger.global.log("Received invalid packet from client " + client.id)
                Logger.global.log("Binary message expected, " + message.type + " received.")
                return
            }

            let data = message.binaryData
            let decoder = BinaryPacket.binaryDecoder
            decoder.reset()
            decoder.readData(new Uint8Array(data).buffer)

            // BinaryPacket.deserialize may only return
            // a BinaryPacket instance

            // noinspection JSValidateTypes
            /** @type BinaryPacket */
            let packet = BinaryPacket.deserialize(decoder, BinaryPacket)

            this.handlePacket(packet, client);
        } catch(e) {
            Logger.global.error("Exception while handling packet from client " + client.id)
            Logger.global.error(e)
        }
    }

    /**
     * Called when client sends packet
     * @param packet {BinaryPacket} Received packet
     * @param client {GameClient} Packet sender
     */
    handlePacket(packet, client) {

    }

    /**
     * Called when client disconnects from the socket
     * @param client {GameClient}
     */
    clientDisconnected(client) {

    }

    /**
     * Called when new client connects to the socket*
     * @param client {GameClient}
     */
    clientConnected(client) {

    }

    /**
     * Binds this socket instance to listen websocket
     * connections
     * @param webSocket
     */
    bindToWebsocket(webSocket) {
        this.webSocketServer = webSocket
        this.webSocketServer.on('request', this.dynamicConnectionHandler)
    }
}

module.exports = SocketPortal
