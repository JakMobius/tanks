
import AbstractClient from '../../networking/abstract-client';

class BrowserClient extends AbstractClient {

    /**
     * @type WebSocket
     */
    socket

    constructor(config) {
        super(config)
        this.socket = null
    }

    connectToServer() {
        if(this.socket != null) throw new Error("Client object cannot be reused")

        this.socket = new WebSocket(this.config.ip);
        this.socket.binaryType = "arraybuffer"

        let self = this
        this.socket.onopen = (event) => self.onOpen(event)
        this.socket.onclose = (event) => self.onClose(event)
        this.socket.onerror = (event) => self.onError(event)
        this.socket.onmessage = (event) => self.onMessage(event)
    }

    onMessage(event) {
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

    writePacket(packet) {
        this.socket.send(packet)
    }

    onClose(event) {
        super.onClose(event);
        this.socket = null
    }

    onError() {
        super.onError()
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