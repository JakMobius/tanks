
const Command = require("../command")
const Chalk = require("chalk")

class StatusCommand extends Command {

    static activeText = Chalk.green.bold("active")
    static inactiveText = Chalk.red.bold("inactive")
    static clusterLinkServerText = Chalk.cyan.bold("server")
    static clusterLinkClientText = Chalk.magenta.bold("client")
    static connectingText = Chalk.yellow.bold("connecting")
    static connectedText = Chalk.green.bold("connected")

    constructor(options) {
        super(options);
    }

    activeText(isActive) {
        return isActive ? StatusCommand.activeText : StatusCommand.inactiveText
    }

    connectingText(isConnected) {
        return isConnected ? StatusCommand.connectedText : StatusCommand.connectingText
    }

    onPerform(args) {
        let logger = this.console.logger
        let server = this.console.server

        let isWebServerActive = server.isWebServerActive()
        let isGameSocketActive = server.isGameSocketActive()
        let isClusterClientActive = server.isClusterClientActive()
        let isClusterSocketActive = server.isClusterSocketActive()

        logger.log("Server status:")
        logger.log(" - web server: " + this.activeText(isWebServerActive))
        if(isWebServerActive) {
            logger.log("   - hub page:  " + this.activeText(server.webServer.hubModule.enabled))
            logger.log("   - game page: " + this.activeText(server.webServer.gameModule.enabled))
        }
        logger.log(" - game socket: " + this.activeText(isGameSocketActive))

        let clusterLinkMode;

        if(isClusterClientActive) clusterLinkMode = StatusCommand.clusterLinkClientText
        else if(isClusterSocketActive) clusterLinkMode = StatusCommand.clusterLinkServerText
        else clusterLinkMode = StatusCommand.inactiveText

        logger.log(" - cluster link: " + clusterLinkMode)

        if(isClusterSocketActive) {
            logger.log("   - remote servers: " + Chalk.green(server.clusterSocket.clients.size))
        }

        if(isClusterClientActive) {
            logger.log("   - connection status: " + this.connectingText(server.clusterClient.isOpen()))
        }
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

module.exports = StatusCommand