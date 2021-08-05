
import AbstractClient from '../../networking/abstract-client';
import Logger from '../log/logger';
import * as WebSocket from 'websocket';
import BinaryPacket from "../../networking/binary-packet";
import {BinarySerializer} from "../../serialization/binary/serializable";
import WebsocketConnection from "../websocket-connection";

export interface ServerWebSocketClientConfig {
    ip: string
}

// Since `WebSocketClient` name is reserved by websocket module,
// this class is named like this

/**
 * This class implements a websocket client on Node.js side
 */
export default class ServerWebSocketClient extends AbstractClient {
    private connecting = false
	public connection: WebsocketConnection | null = null;
	public reconnect: boolean;
	public reconnectionDelay: number;
	public logger: Logger;
	public ip: string

    constructor(config: ServerWebSocketClientConfig) {
        super()
        this.ip = config.ip
        this.reconnect = false
        this.reconnectionDelay = 5000 // ms
        this.logger = new Logger()
    }

    connectToServer() {
	    if(this.connecting || this.connection) return
        this.reconnect = true
        this.connecting = true

        const client = new WebSocket.client()

        client.on("connectFailed", (error) => this.onError(error))
        client.on("connect", (connection) => {
            this.connection = new WebsocketConnection(connection)

            this.onConnection()

            this.connection.on('close', (code: number, desc: string) => this.onClose(code, desc));
            this.connection.on('packet', (packet) => this.handlePacket(packet));
        })

        client.connect(this.ip)
    }

    isConnecting() {
        return this.connecting
    }

    isOpen() {
        return this.connection && this.connection.isReady()
    }

    writePacket(packet: BinaryPacket) {
        this.connection.send(packet)
    }

    disconnect(reason?: string) {
        this.reconnect = false
        this.closeConnection(reason)
    }

    closeConnection(reason: string) {
        if(this.connection) this.connection.close(reason)
    }

    getIpAddress(): string {
        return this.ip;
    }
}