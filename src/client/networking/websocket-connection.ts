import Connection from "../../networking/connection";

export default class WebsocketConnection extends Connection {

    socket: WebSocket

    constructor(ip: string) {
        super();

        this.socket = new WebSocket(ip);
        this.socket.binaryType = "arraybuffer"

        this.socket.onopen = () => this.onReady()

        this.socket.onclose = (event) => {
            this.emit("close", event.code, event.reason)
        }
        this.socket.onerror = (event) => {
            this.emit("error", event)
        }
        this.socket.onmessage = (event) => this.onMessage(event)
    }

    isReady(): boolean {
        return this.socket.readyState === WebSocket.OPEN;
    }

    close(reason?: string): void {
        this.socket.close(0, reason)
    }

    getIpAddress(): string {
        return "";
    }

    private onMessage(event: MessageEvent) {
        if(event.data instanceof ArrayBuffer) {
            this.handleData(event.data)
        }
    }

    handleData(data: ArrayBuffer) {
        this.handleIncomingData(data)
    }

    protected handleOutgoingData(data: ArrayBuffer): void {
        this.socket.send(data)
    }
}