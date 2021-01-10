
import UniversalPortListener from './universal-port-listener';
import WebServer from './webserver/webserver';
import GameSocket from './socket/game-server/game-socket-portal';
import ClusterSocket from './socket/hub-server/cluster-socket-portal';
import ServerParticipantClient from './socket/participant-client/server-participant-client';
import CpuUsageWatcher from 'src/utils/cpu-usage-watcher';
import GameSocketPortal from "./socket/game-server/game-socket-portal";
import ClusterSocketPortal from "./socket/hub-server/cluster-socket-portal";
import Console from "./console/console";

class Server {
    portListeners = new Map<Number, UniversalPortListener>()
    gameSocket: GameSocketPortal | null = null
    clusterSocket: ClusterSocketPortal | null = null
    clusterClient: ServerParticipantClient | null = null
    gamePageActive: boolean = false
    hubPageActive: boolean = false
    webServer: WebServer = null
    clusterPort: number | null = null
    clientPort: number | null = null
    clusterServerIP: string | null = null
    clusterPassword: string | null = null
    cpuUsageWatcher: CpuUsageWatcher = null

    console: Console = null

    constructor() {
        this.cpuUsageWatcher = new CpuUsageWatcher()
    }

    setHubPageActive(active: boolean): void {
        this.hubPageActive = active

        this.setWebServerActive(this.hubPageActive || this.gamePageActive)
        if(this.webServer) {
            this.webServer.hubModule.enabled = active
        }

        this.setClusterSocketServerActive(active)
        this.setClusterClientActive(!active)
    }

    setGamePageActive(active: boolean): void {
        this.gamePageActive = active
        this.setWebServerActive(this.hubPageActive || this.gamePageActive)
        if(this.webServer) {
            this.webServer.gameModule.enabled = active
        }
    }

    setWebServerActive(active: boolean): void {
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

    setGameSocketActive(active: boolean): void {
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

    setClusterClientActive(active: boolean): void {

        if(this.clusterServerIP === null) return

        if(active) {
            if(this.clusterClient) return

            this.clusterClient = new ServerParticipantClient({
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

    setClusterSocketServerActive(active: boolean): void {
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

    isWebServerActive(): boolean {
        return !!this.webServer
    }

    isGameSocketActive(): boolean {
        return !!this.gameSocket
    }

    isClusterClientActive(): boolean {
        return !!this.clusterClient
    }

    isClusterSocketActive(): boolean {
        return !!this.clusterSocket
    }

    getPortListener(port: number): UniversalPortListener {
        let cached = this.portListeners.get(port)
        if (cached) return cached

        let server = new UniversalPortListener(port)
        this.portListeners.set(port, server)
        return server
    }

    setClientPort(port: number): void {
        this.clientPort = port
    }

    setClusterPort(port: number): void {
        this.clusterPort = port
    }

    setSocketServerIP(ip: string): void {
        this.clusterServerIP = ip
    }

    setClusterPassword(password: string): void {
        this.clusterPassword = password
    }

    terminate(): void {
        this.console.window.screen.destroy()
        this.setHubPageActive(false)
        this.setGamePageActive(false)
        this.setClusterClientActive(false)
        this.setWebServerActive(false)
        this.setClusterSocketServerActive(false)
    }
}

export default Server;