import AbstractPlayer from "../abstract-player";
import ClientGameWorld from "./client-game-world";
import ClientTank from "./entity/tank/client-tank";

export default class ClientPlayer extends AbstractPlayer<ClientTank, ClientGameWorld> {

}