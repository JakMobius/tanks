import ServerGameStateController from "src/server/room/game-modes/server-game-state-controller";
import {CTFEventData, CTFGameData} from "src/entity/types/controller-ctf/ctf-game-data";
import ServerCTFControllerComponent from "src/entity/types/controller-ctf/server-side/server-ctf-controller-component";

export default abstract class CTFGameStateController extends ServerGameStateController<ServerCTFControllerComponent, CTFGameData, CTFEventData> {

}
