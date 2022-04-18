import Connection from "./connection";

export default class PipedConnection extends Connection {



    getIpAddress(): string {
        return "127.0.0.1";
    }

    close(reason?: string): void {}
    isReady(): boolean { return true }
}