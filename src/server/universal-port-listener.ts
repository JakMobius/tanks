import WebSocket from 'websocket';
import * as HTTP from 'http';

export default class UniversalPortListener {

    /**
     * Port that is being listened by this instance
     */
    port: number

    /**
     * Websocket retain counter
     */
    socketRetainCounter = 0

    /**
     * HTTPServer retain counter
     */
    httpRetainCounter = 0

    /**
     * HTTPServer bound to this port
     */
    httpServer: HTTP.Server

    /**
     * WebSocket server bound to this port
     */
    webSocketServer: WebSocket.server

    constructor(port: number) {
        this.port = port
    }

    retainHTTP() {
        this.httpRetainCounter++

        if(!this.httpServer) {
            this.httpServer = HTTP.createServer()
            this.httpServer.listen(this.port)
        }
    }

    releaseHTTP() {
        this.httpRetainCounter--

        if(this.httpRetainCounter === 0) {
            this.httpServer.close()
            this.httpServer = null
        }
    }

    retainWebsocket() {
        // since WebSocket uses HTTP server,
        // ensure it is configured and will not be destroyed.

        this.retainHTTP()
        this.socketRetainCounter++

        if(!this.webSocketServer) {
            this.webSocketServer = new WebSocket.server({
                httpServer: this.httpServer
            })
        }
    }

    releaseWebsocket() {
        this.socketRetainCounter--

        if(this.socketRetainCounter === 0) {
            this.webSocketServer.shutDown()
            this.webSocketServer = null
        }

        this.releaseHTTP()
    }
}