import ClientGameWorld from "../clientgameworld";
import Game from "../../server/room/game";

class CombinedGameWorld {
    clientWorld: ClientGameWorld
    serverWorld: Game
}