
import AbstractClient from '../../networking/abstract-client';
import Logger from '../log/logger';
import * as WebSocket from 'websocket';
import ServerParticipantConnection from './participant-client/server-participant-connection';

export interface ServerWebSocketClientConfig {
    ip: string
}

// Since `WebSocketClient` name is reserved by websocket module,
// this class is named like this

/**
 * This class implements a websocket client on Node.js side
 */
class ServerWebSocketClient extends AbstractClient {
	public webSocketConnection: any;
	public reconnect: any;
	public reconnectionDelay: any;
	public logger: any;
	public ip: string

    public client: WebSocket.client

    constructor(config: ServerWebSocketClientConfig) {
        super()
        this.ip = config.ip
        this.client = null
        this.webSocketConnection = null
        this.reconnect = false
        this.reconnectionDelay = 5000 // ms
        this.logger = new Logger()
    }

    connectToServer() {
        if(this.client != null) return;
        this.reconnect = true

        this.client = new WebSocket.client()

        this.client.on("connectFailed", (error) => this.onError(error))
        this.client.on("connect", (connection) => {
            this.webSocketConnection = connection

            this.onConnection()

            connection.on('error', (error) => this.onError(error));
            connection.on('close', (code, reason) => this.onClose(code, reason));
            connection.on('message', (message) => this.onMessage(message));
        })

        this.client.connect(this.ip)
    }

    onMessage(message: WebSocket.IMessage) {
        try {
            if(message.type !== "binary") {
                this.logger.log("Received invalid packet")
                this.logger.log("Binary message expected, " + message.type + " received.")
                return
            }

            super.onData(new Uint8Array(message.binaryData).buffer);
        } catch(e) {
            this.logger.log("Exception while handling packet")
            this.logger.log(e)
        }
    }

    isConnecting() {
        return !!this.client
    }

    isOpen() {
        return !!this.webSocketConnection
    }

    writePacket(packet: ArrayBuffer) {
        this.webSocketConnection.sendBytes(Buffer.from(packet))
    }

    disconnect(reason?: string) {
        this.reconnect = false
        this.closeConnection(reason)
    }

    closeConnection(reason: string) {
        if(this.webSocketConnection) this.webSocketConnection.close(WebSocket.connection.CLOSE_REASON_NORMAL, reason)
        if(this.client) this.client.abort()
    }
}

export default ServerWebSocketClient;