import Connection from "./connection";

export default class LocalConnection extends Connection {
    isReady(): boolean {
        return true
    }

    getIpAddress(): string {
        return "127.0.0.1"
    }

    close(reason?: string): void {}
}