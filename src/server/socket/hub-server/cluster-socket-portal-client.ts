
import SocketPortalClient from '../socket-portal-client';

class ClusterSocketPortalClient extends SocketPortalClient {

    rooms = []

    constructor(config) {
        super(config);
    }


}

export default ClusterSocketPortalClient;