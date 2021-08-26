
import UniversalPortListener from './universal-port-listener';
import WebServer from './webserver/webserver';
import GameSocket from './socket/game-server/game-socket-portal';
import ClusterSocket from './socket/hub-server/cluster-socket-portal';
import CpuUsageWatcher from 'src/utils/cpu-usage-watcher';
import GameSocketPortal from "./socket/game-server/game-socket-portal";
import ClusterSocketPortal from "./socket/hub-server/cluster-socket-portal";
import Console from "./console/console";
import ServerDatabase from "./db/server-database";
import {parseServerConfig} from "./server-config-parser";
import EventEmitter from "../utils/event-emitter";
import ClusterHandshakeConnection from "./socket/participant-client/cluster-handshake-connection";
import WebsocketConnection from "./websocket-connection";
import Connection from "../networking/connection";
import ConnectionClient from "../networking/connection-client";

export interface ServerClusterConfig {
    url: string
    port: number
    password: string
}

export interface WebServerConfig {
    sessionKey: string
}

export interface ServerConfig {
    webServer: WebServerConfig
    cluster?: ServerClusterConfig,
    database: ServerDatabase,
    port: number
}

export default class Server extends EventEmitter {
    config: ServerConfig;
    static configParser = parseServerConfig
    portListeners = new Map<Number, UniversalPortListener>()
    gameSocket: GameSocketPortal | null = null
    clusterSocket: ClusterSocketPortal | null = null
    clusterClient: ConnectionClient | null = null
    gamePageActive: boolean = false
    hubPageActive: boolean = false
    webServer: WebServer = null
    cpuUsageWatcher: CpuUsageWatcher = null
    db: ServerDatabase

    console: Console = null

    constructor(config: ServerConfig) {
        super()
        this.cpuUsageWatcher = new CpuUsageWatcher()

        this.config = config
        this.db = config.database
    }

    setConsole(console: Console) {
        this.console = console
        console.server = this
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

            let portListener = this.getPortListener(this.config.port)
            portListener.retainHTTP()

            this.webServer = new WebServer(this)
            this.webServer.listen(portListener.httpServer)
        } else {
            if(!this.webServer) return

            this.webServer.disable()
            this.webServer = null
            this.getPortListener(this.config.port).retainHTTP()
        }
    }

    setGameSocketActive(active: boolean): void {
        if(active) {
            if (this.gameSocket) return

            let portListener = this.getPortListener(this.config.port)
            portListener.retainWebsocket()

            this.gameSocket = new GameSocket();
            this.gameSocket.bindToWebsocket(portListener.webSocketServer)
        } else {
            if(!this.gameSocket) return

            this.gameSocket.terminate()
            this.gameSocket = null
            this.getPortListener(this.config.port).retainWebsocket()
        }
    }

    setClusterClientActive(active: boolean): void {
        if(this.config.cluster === null) return

        if(active) {
            if(this.clusterClient) return

            const websocketConnection = WebsocketConnection.clientConnection(this.config.cluster.url)
            const handshakeConnection = new ClusterHandshakeConnection(this.config.cluster.password)

            Connection.pipeStraight(websocketConnection, handshakeConnection)

            this.clusterClient = new ConnectionClient(handshakeConnection)
        } else {
            if(!this.clusterClient) return

            this.clusterClient.connection.close()
            this.clusterClient = null
        }
    }

    setClusterSocketServerActive(active: boolean): void {
        if(this.config.cluster === null) return

        if(active) {
            if(this.clusterSocket) return

            let portListener = this.getPortListener(this.config.cluster.port)
            portListener.retainWebsocket()

            this.clusterSocket = new ClusterSocket({
                password: this.config.cluster.password
            })
            this.clusterSocket.bindToWebsocket(portListener.webSocketServer)
        } else {
            if(!this.clusterSocket) return

            this.clusterSocket.terminate()
            this.getPortListener(this.config.cluster.port).releaseWebsocket()
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

    async terminate(): Promise<void> {
        this.setHubPageActive(false)
        this.setGamePageActive(false)
        this.setClusterClientActive(false)
        this.setWebServerActive(false)
        this.setClusterSocketServerActive(false)

        this.emit("terminate")
    }
}