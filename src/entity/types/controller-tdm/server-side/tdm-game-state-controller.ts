import ServerGameStateController from "src/server/room/game-modes/server-game-state-controller";
import {TDMGameState} from "src/entity/types/controller-tdm/tdm-game-state";
import ServerTDMControllerComponent from "src/entity/types/controller-tdm/server-side/server-tdm-controller-component";

export default abstract class TDMGameStateController extends ServerGameStateController<ServerTDMControllerComponent, TDMGameState> {

}
