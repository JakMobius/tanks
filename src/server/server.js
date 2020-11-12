
const UniversalPortListener = require("./universal-port-listener")
const WebServer = require("./webserver/webserver")
const GameSocket = require("./socket/game-socket-portal")
const ClusterSocket = require("./socket/cluster-socket-portal")
const ClusterClient = require("./socket/cluster-client")

class Server {

    /**
     * @type {Map<Number, UniversalPortListener>}
     */
    portListeners = new Map()

    /**
     * @type {GameSocketPortal}
     */
    gameSocket = null

    /**
     * @type {ClusterSocketPortal}
     */
    clusterSocket = null

    /**
     * @type {ClusterClient}
     */
    clusterClient = null

    /**
     * @type {boolean}
     */
    gamePageActive = false

    /**
     * @type {boolean}
     */
    hubPageActive = false

    /**
     * @type {WebServer}
     */
    webServer = null

    /**
     * @type {number | null}
     */
    clusterPort = null

    /**
     * @type {number | null}
     */
    clientPort = null

    /**
     * @type {number | null}
     */
    clusterServerIP = null

    /**
     * @type {string | null}
     */
    clusterPassword = null

    console = null

    constructor() {}

    setHubPageActive(active) {
        this.hubPageActive = active

        this.setWebServerActive(this.hubPageActive || this.gamePageActive)
        if(this.webServer) {
            this.webServer.hubModule.enabled = active
        }

        this.setClusterSocketServerActive(active)
        this.setClusterClientActive(!active)
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
            if(this.webServer) return

            let portListener = this.getPortListener(this.clientPort)
            portListener.retainHTTP()

            this.webServer = new WebServer()
            this.webServer.listen(portListener.httpServer)
        } else {
            if(!this.webServer) return

            this.webServer.disable()
            this.webServer = null
            this.getPortListener(this.clientPort).retainHTTP()
        }
    }

    setGameSocketActive(active) {
        if(active) {
            if (this.gameSocket) return

            let portListener = this.getPortListener(this.clientPort)
            portListener.retainWebsocket()

            this.gameSocket = new GameSocket();
            this.gameSocket.bindToWebsocket(portListener.webSocketServer)
        } else {
            if(!this.gameSocket) return

            this.gameSocket.terminate()
            this.gameSocket = null
            this.getPortListener(this.clientPort).retainWebsocket()
        }
    }

    setClusterClientActive(active) {

        if(this.clusterServerIP === null) return

        if(active) {
            if(this.clusterClient) return

            this.clusterClient = new ClusterClient({
                ip: this.clusterServerIP
            })

            this.clusterClient.password = this.clusterPassword
            this.clusterClient.connectToServer()
        } else {
            if(!this.clusterClient) return

            this.clusterClient.disconnect()
            this.clusterClient = null
        }
    }

    setClusterSocketServerActive(active) {
        if(this.clusterPort === null) return

        if(active) {
            if(this.clusterSocket) return

            let portListener = this.getPortListener(this.clusterPort)
            portListener.retainWebsocket()

            this.clusterSocket = new ClusterSocket()
            this.clusterSocket.password = this.clusterPassword
            this.clusterSocket.bindToWebsocket(portListener.webSocketServer)
        } else {
            if(!this.clusterSocket) return

            this.clusterSocket.terminate()
            this.getPortListener(this.clusterPort).releaseWebsocket()
            this.clusterSocket = null
        }
    }

    isWebServerActive() {
        return !!this.webServer
    }

    isGameSocketActive() {
        return !!this.gameSocket
    }

    isClusterClientActive() {
        return !!this.clusterClient
    }

    isClusterSocketActive() {
        return !!this.clusterSocket
    }

    getPortListener(port) {
        let cached = this.portListeners.get(port)
        if (cached) return cached

        let server = new UniversalPortListener(port)
        this.portListeners.set(port, server)
        return server
    }

    setClientPort(port) {
        this.clientPort = port
    }

    setClusterPort(port) {
        this.clusterPort = port
    }

    setSocketServerIP(ip) {
        this.clusterServerIP = ip
    }

    setClusterPassword(password) {
        this.clusterPassword = password
    }

    terminate() {
        this.console.window.screen.destroy()
        this.setHubPageActive(false)
        this.setGamePageActive(false)
        this.setClusterClientActive(false)
        this.setWebServerActive(false)
        this.setClusterSocketServerActive(false)
    }
}

module.exports = Server