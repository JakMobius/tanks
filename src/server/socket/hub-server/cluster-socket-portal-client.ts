
import SocketPortalClient from '../socket-portal-client';
import GameWorld from "../../../gameworld";

class ClusterSocketPortalClient extends SocketPortalClient {

    rooms: GameWorld[] = []

    constructor(config: any) {
        super(config);
    }


}

export default ClusterSocketPortalClient;