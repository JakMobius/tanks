import ServerGameStateController from "src/server/room/game-modes/server-game-state-controller";
import ServerDMControllerComponent from "src/entity/types/controller-dm/server-side/server-dm-controller-component";
import {DMGameState} from "src/entity/types/controller-dm/dm-game-state";

export default abstract class DMGameStateController extends ServerGameStateController<ServerDMControllerComponent, DMGameState> {

}
