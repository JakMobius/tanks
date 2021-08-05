import SocketPortalClient, {SocketPortalClientConfig} from '../socket/socket-portal-client';
import AIConnection from './ai_connection';
import Server from "../server";
import Room from "../room/room";

export interface GameBotData {

}

export default class GameBot extends SocketPortalClient<GameBotData> {

}