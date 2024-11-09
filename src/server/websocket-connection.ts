import Connection from '../networking/connection';
import WebSocket, * as Websocket from 'websocket';
import {IClientConfig} from 'websocket';
import BinaryPacket from "../networking/binary-packet";
import * as http from "http";

const WebSocketConnection = WebSocket.connection

export interface WebsocketClientConnectionConfig {
    requestedProtocols?: string | string[]
    origin?: string
    headers?: http.OutgoingHttpHeaders
    extraRequestOptions?: http.RequestOptions
    clientConfig?: IClientConfig
}

export default class WebsocketConnection extends Connection {

    websocketConnection: WebSocket.connection = null

    constructor(websocketConnection?: WebSocket.connection) {
        super();
        if(websocketConnection) this.bindToWebsocketConnection(websocketConnection)
    }

    bindToWebsocketConnection(connection?: WebSocket.connection) {
        if(this.websocketConnection) {
            throw new Error("This WebsocketConnection is already bound to a socket")
        }

        this.websocketConnection = connection
        connection.on('message', (message: Websocket.IMessage) => {
            this.handleMessage(message)
        })

        connection.on("close", (code: number, desc: string) =>  {
            this.emit("close", code, desc)
        });
    }

    static clientConnection(ip: string, config?: WebsocketClientConnectionConfig) {
        config = config || {}

        const connection = new WebsocketConnection()
        const websocketClient = new WebSocket.client(config.clientConfig)

        websocketClient.on("connect", (websocketConnection) => {
            connection.bindToWebsocketConnection(websocketConnection)
        })

        websocketClient.on("connectFailed", (error) => {
            connection.emit("error", error)
        })

        websocketClient.connect(ip, config.requestedProtocols, config.origin, config.headers, config.extraRequestOptions)

        return connection
    }

    isReady() {
        return this.websocketConnection && this.websocketConnection.state === "open"
    }

    sendOutgoingPacket(packet: BinaryPacket) {
        this.websocketConnection.sendBytes(Buffer.from(packet.getData()))
    }

    close(reason?: string) {
        if(this.websocketConnection) {
            this.websocketConnection.close(WebSocketConnection.CLOSE_REASON_NORMAL, reason)
        }
    }

    private handleMessage(message: Websocket.IMessage) {
        try {
            if(message.type !== "binary") return
            this.handleIncomingData(new Uint8Array(message.binaryData).buffer)
        } catch(e) {
            this.emit("error", e)
        }
    }

    getIpAddress(): string {
        if(!this.websocketConnection) return "unknown"
        return this.websocketConnection.remoteAddress;
    }
}