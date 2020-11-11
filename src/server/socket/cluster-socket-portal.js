
const SocketPortal = require("./socket-portal")
const Logger = require("../log/logger")

class ClusterSocketPortal extends SocketPortal {
    constructor(config) {
        super(config);
    }

    handleRequest(request) {
        // Only handling /cluster-link requests

        if(request.resourceURL.path === "/cluster-link") {
            super.handleRequest(request);
        }
    }

    clientConnected(client) {

    }

    clientDisconnected(client) {

    }
}

module.exports = ClusterSocketPortal