
const HTTP = require('http')
const WebServer = require("./webserver/webserver")
const GameSocket = require("./gamesocket")

class Server {

    portListener = null

    /**
     * @type {GameSocket}
     */
    socket = null

    gamePageActive = false
    hubPageActive = false

    /**
     * @type {WebServer}
     */
    webServer = null

    constructor() {

    }

    setHubPageActive(active) {
        this.hubPageActive = active
        this.setWebServerActive(this.hubPageActive || this.gamePageActive)
        if(this.webServer) {
            this.webServer.hubModule.enabled = active
        }
    }

    setGamePageActive(active) {
        this.gamePageActive = active
        this.setWebServerActive(this.hubPageActive || this.gamePageActive)
        if(this.webServer) {
            this.webServer.gameModule.enabled = active
        }
    }

    setWebServerActive(active) {
        if(active === (!!this.webServer)) return;
        if(active) {
            this.webServer = new WebServer()
            this.webServer.listen(this.portListener)
        } else {
            this.webServer.disable()
            this.webServer = null
        }
    }

    setRoomsActive(active) {
        if(active) {
            if (this.socket) return
            this.socket = new GameSocket();
            this.socket.listen(this.portListener)
        } else {
            this.socket.terminate()
            this.socket = null
        }
    }

    bindPort(port) {
        this.portListener = HTTP.createServer()
        this.portListener.listen(port)
    }

    terminate() {

    }
}

module.exports = Server