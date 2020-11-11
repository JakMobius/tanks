
const WebSocket = require('websocket')
const HTTP = require('http')

class UniversalPortListener {

    /**
     * Port that is being listened by this instance
     * @type number
     */
    port

    /**
     * Websocket retain counter
     * @type number
     */
    socketRetainCounter = 0

    /**
     * HTTPServer retain counter
     * @type number
     */
    httpRetainCounter = 0

    /**
     * HTTPServer binded to this port
     */
    httpServer

    /**
     * WebSocket server binded to this port
     */
    webSocketServer

    constructor(port) {
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
        // we are ensuring it is configured and will
        // not be destroyed.

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

module.exports = UniversalPortListener