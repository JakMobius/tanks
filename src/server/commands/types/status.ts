import Command, {CommandConfig} from '../command';
import CommandFlag from '../command-flag';
import Chalk from 'chalk';
import filesize from 'src/utils/fs/file-size';
import Server from "../../server";

class StatusCommand extends Command {
	public groupDepth: any;
    static activeText = "§!0F0;active"
    static inactiveText = "§!F00;inactive"
    static clusterLinkServerText = "§0FF;server"
    static clusterLinkClientText = "§F0F;client"
    static connectingText = "§!FF0;connecting"
    static connectedText = "§!0F0;connected"

    constructor(options: CommandConfig) {
        super(options);

        this.addFlag(new CommandFlag({
            type: "flag",
            name: "cpu",
            aliases: [],
            description: "Show CPU usage"
        }))

        this.addFlag(new CommandFlag({
            type: "flag",
            name: "memory",
            aliases: ["mem"],
            description: "Show memory usage"
        }))

        this.addFlag(new CommandFlag({
            type: "flag",
            name: "socket",
            aliases: ["sock"],
            description: "Show game socket status"
        }))

        this.addFlag(new CommandFlag({
            type: "flag",
            name: "webserver",
            aliases: ["ws"],
            description: "Show webserver status"
        }))

        this.addFlag(new CommandFlag({
            type: "flag",
            name: "cluster-link",
            aliases: ["cl"],
            description: "Show webserver status"
        }))

        this.groupDepth = 0
    }

    activeText(isActive: boolean) {
        return isActive ? StatusCommand.activeText : StatusCommand.inactiveText
    }

    connectingText(isConnected: boolean) {
        return isConnected ? StatusCommand.connectedText : StatusCommand.connectingText
    }

    printStatus(name: string, status?: string) {

        let prefix = " - "

        for(let i = 0; i < this.groupDepth; i++) {
            prefix = "  " + prefix;
        }

        if (status === undefined) {
            this.console.logger.log(prefix + name);
        } else {
            this.console.logger.log(prefix + name + ": " + status);
        }
    }

    printStatusIsActive(name: string, isActive: boolean) {
        this.printStatus(name, this.activeText(isActive))
    }

    formatCPUUsage(server: Server, seconds: number) {
        let cpuMicroseconds = server.cpuUsageWatcher.getCpuUsage(seconds)
        if(cpuMicroseconds < 0) return "§777;unknown"
        let percentage = (cpuMicroseconds / 1000000 / seconds)
        let string = percentage.toFixed(3) + "%"
        if(percentage < 50) string = "§0F0;" + string
        else if(percentage < 70) string = "§FF0;" + string
        else if(percentage < 90) string = "§F70;" + string
        else string = "§F00;" + string
        return string
    }

    beginStatusGroup() {
        this.groupDepth++
    }

    endStatusGroup() {
        this.groupDepth--
    }

    onPerform(args: string[]) {
        let flags = this.findFlags(args)

        this.logFlagErrors(flags, this.console.logger)

        this.printServerStatus(flags.flags)
    }

    printServerStatus(flags: Map<string, boolean | string[]>) {
        let logger = this.console.logger
        logger.log("Server status:")

        let noFlags = flags.size === 0

        if(noFlags || flags.get("cpu"))       this.printCPUUtilizationStatus(!noFlags)
        if(noFlags || flags.get("memory"))    this.printMemoryUtilizationStatus(!noFlags)
        if(noFlags || flags.get("webserver")) this.printWebserverStatus(!noFlags)
        if(noFlags || flags.get("socket"))    this.printGameSocketStatus(!noFlags)
        if(noFlags || flags.get("cluster"))   this.printClusterLinkStatus(!noFlags)
    }

    printMemoryUtilizationStatus(detailed: boolean) {

        let memoryUsage = process.memoryUsage()

        if(detailed) {
            this.printStatus("memory usage")
            this.beginStatusGroup()
            this.printStatus("RSS", "§0FF;" + filesize(memoryUsage.rss))
            this.printStatus("Heap used", "§0FF;" + filesize(memoryUsage.heapUsed))
            this.printStatus("Heap total", "§0FF;" + filesize(memoryUsage.heapTotal))
            this.printStatus("Array buffers", "§0FF;" + filesize(memoryUsage.arrayBuffers))
            this.printStatus("External", "§0FF;" + filesize(memoryUsage.external))
            this.endStatusGroup()
        } else {
            this.printStatus("memory usage", "§0FF;" + filesize(process.memoryUsage().rss))
        }
    }
    printCPUUtilizationStatus(detailed: boolean) {
        let server = this.console.server

        if(detailed) {
            this.printStatus("cpu usage")
            this.beginStatusGroup()
            this.printStatus("10s", this.formatCPUUsage(server, 10))
            this.printStatus("30s", this.formatCPUUsage(server, 30))
            this.printStatus("1m", this.formatCPUUsage(server, 60))
            this.printStatus("5m", this.formatCPUUsage(server, 300))
            this.printStatus("15m", this.formatCPUUsage(server, 900))
            this.endStatusGroup()
        } else {
            this.printStatus("cpu usage: " + this.formatCPUUsage(server, 10))
        }
    }

    printWebserverStatus(detailed: boolean) {
        let server = this.console.server
        let isWebServerActive = server.isWebServerActive()

        this.printStatusIsActive("web server", isWebServerActive)

        if(isWebServerActive) {
            this.beginStatusGroup()
            this.printStatusIsActive("hub page", server.webServer.hubModule.enabled)
            this.printStatusIsActive("game page", server.webServer.gameModule.enabled)
            this.endStatusGroup();
        }
    }

    printGameSocketStatus(detailed: boolean) {
        let server = this.console.server
        let isGameSocketActive = server.isGameSocketActive()

        this.printStatusIsActive("game socket", isGameSocketActive)
        if(isGameSocketActive) {
            this.beginStatusGroup()
            this.printStatus("active games", Chalk.green(server.gameSocket.games.size))
            let totalPlayers = 0
            for(let game of server.gameSocket.games.values()) totalPlayers += game.getCurrentOnline()
            this.printStatus("total players", Chalk.green(totalPlayers))
            this.endStatusGroup()
        }

    }

    printClusterLinkStatus(detailed: boolean) {
        let server = this.console.server
        let isClusterClientActive = server.isClusterClientActive()
        let isClusterSocketActive = server.isClusterSocketActive()

        let clusterLinkMode;

        if(isClusterClientActive) clusterLinkMode = StatusCommand.clusterLinkClientText
        else if(isClusterSocketActive) clusterLinkMode = StatusCommand.clusterLinkServerText
        else clusterLinkMode = StatusCommand.inactiveText

        this.printStatus("cluster connection", clusterLinkMode)
        this.beginStatusGroup()
        if(isClusterSocketActive) {
            this.printStatus("remote servers", Chalk.green(server.clusterSocket.clients.size))
        }

        if(isClusterClientActive) {
            this.printStatus("connection status", this.connectingText(server.clusterClient.connection.isReady()))
        }
        this.endStatusGroup()
    }

    getDescription() {
        return "View current server status"
    }

    getUsage() {
        return `status`
    }

    getName() {
        return "status";
    }
}

export default StatusCommand;