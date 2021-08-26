import ServerGameWorld from "./server-game-world";
import AbstractPlayer from "../abstract-player";
import ServerTank from "./entity/tank/server-tank";

export default class ServerPlayer extends AbstractPlayer<ServerTank, ServerGameWorld> {

}