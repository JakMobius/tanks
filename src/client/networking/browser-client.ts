
import AbstractClient from '../../networking/abstract-client';

export interface BrowserClientConfig {
    ip: string
}

class BrowserClient extends AbstractClient {

    public ip: string
    public socket: WebSocket

    constructor(config: BrowserClientConfig) {
        super()
        this.ip = config.ip
        this.socket = null
    }

    connectToServer() {
        if(this.socket != null) throw new Error("Client object cannot be reused")

        this.socket = new WebSocket(this.ip);
        this.socket.binaryType = "arraybuffer"

        let self = this
        this.socket.onopen = (event) => self.onOpen()
        this.socket.onclose = (event) => self.onClose(event.code, event.reason)
        this.socket.onerror = (event) => self.onError()
        this.socket.onmessage = (event) => self.onMessage(event)
    }

    onMessage(event: MessageEvent) {
        if(event.data instanceof ArrayBuffer) {
            this.onData(event.data)
        }
    }

    isConnecting() {
        return this.socket.readyState === WebSocket.CONNECTING;
    }

    isOpen() {
        return this.socket.readyState === WebSocket.OPEN;
    }

    writePacket(packet: ArrayBuffer) {
        this.socket.send(packet)
    }

    onClose(code: number, reason: string) {
        super.onClose(code, reason);
        this.socket = null
    }

    onError(error?: Error) {
        super.onError(error)
        this.socket = null
    }

    disconnect() {
        if(this.socket) {
            this.socket.close()
            this.socket = null
        }
    }
}

export default BrowserClient;