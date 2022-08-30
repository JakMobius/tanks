import Game, {GameConfig} from "./game";
import Player from "../../player";
import EntityModel from "../../entity/entity-model";
import ServerEntityPrefabs from "../entity/server-entity-prefabs";
import SocketPortalClient from "../socket/socket-portal-client";
import PlayerConnectionManager from "../player-connection-manager";
import {EntityType} from "../../entity/entity-type";

export default class ServerGame extends Game {
    constructor(options: GameConfig) {
        super(options);
    }

    protected onClientConnect(client: SocketPortalClient) {
        super.onClientConnect(client)

        let player = new Player({
            id: client.id,
            nick: "Player " + Math.floor(Math.random() * 0xFFFF).toString(16)
        })

        PlayerConnectionManager.attach(player, client)
        player.setWorld(this.world)

        this.spawnPlayer(player)
    }

    private spawnPlayer(player: Player) {

        const tank = new EntityModel()
        ServerEntityPrefabs.types.get(EntityType.TANK_MONSTER)(tank)
        this.world.appendChild(tank)
        tank.emit("respawn")

        player.setTank(tank)

        this.respawnPlayer(tank)
    }
}