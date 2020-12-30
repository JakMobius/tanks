
const SocketPortalClient = require("../socket-portal-client")

class ClusterSocketPortalClient extends SocketPortalClient {

    rooms = []

    constructor(config) {
        super(config);
    }


}

module.exports = ClusterSocketPortalClient