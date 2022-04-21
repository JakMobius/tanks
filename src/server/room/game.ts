import Team from '../team';
import Color from '../../utils/color';
import ServerTank from '../entity/tank/server-tank';
import ServerGameWorld from '../server-game-world';
import HighPrecisionLoop from '../../utils/loop/high-precision-loop';
import Room from './room';
import Logger from '../log/logger';
import SocketPortalClient from "../socket/socket-portal-client";
import GameMap from "../../map/game-map";

import 'src/entity/tanks/model-loader'
import 'src/server/entity/bullet/type-loader';
import 'src/server/entity/tank/type-loader'
import 'src/server/effects/type-loader';
import 'src/map/block-state/type-loader';

import HTMLEscape from "../../utils/html-escape";
import PlayerChatPacket from "../../networking/packets/game-packets/player-chat-packet";
import AbstractPlayer from "../../abstract-player";
import TankModel from "../../entity/tanks/tank-model";
import ServerPlayer from "../server-player";
import Loop from "../../utils/loop/loop";
import ServerWorldBridge from "../server-world-bridge";
import ServerEntity from "../entity/server-entity";
import PhysicalComponent from "../../entity/components/physics-component";
import TilemapComponent from "../../physics/tilemap-component";
import HealthComponent from "../../entity/components/health-component";
import WorldCommunicationPacket from "../../networking/packets/game-packets/world-communication-packet";
import {GameSocketPortalClient} from "../socket/game-server/game-socket-portal";
import {Constructor} from "../../serialization/binary/serializable";
import EntityModel from "../../entity/entity-model";
import {EntityType} from "../../client/entity/client-entity";
import ServerSniperTank from "../entity/tank/types/server-sniper-tank";

interface GameConfig {
    name: string
    map: GameMap
    loop?: Loop
}

export default class Game extends Room {
    public teams = [
        new Team(0, new Color(58, 104, 193)),
        new Team(1, new Color(222, 54, 54)),
        new Team(2, new Color(14, 193, 1))
    ]
    public loop: Loop;
    public ticks: number = 0;
    public logger: Logger = new Logger();
    public world: ServerGameWorld;
    public tps: number = 20;
    public spt: number;
    public timer: number;

    constructor(options: GameConfig) {
        super()

        this.ticks = 0
        this.spt = 1 / this.tps
        this.name = options.name

        this.world = new ServerGameWorld({
            map: options.map
        })

        ServerWorldBridge.buildBridge(this.world, this.portal)

        this.portal.on("client-connect",    (client) => this.onClientConnect(client))
        this.portal.on("client-disconnect", (client) => this.onClientDisconnect(client))

        this.world.on("player-create",      (player) => this.onPlayerJoin(player))
        this.world.on("player-changed-tank",(player) => this.onPlayerChangedTank(player))
        this.world.on("player-remove",      (player) => this.onPlayerLeave(player))
        this.world.on("player-respawn",     (player) => this.onPlayerRespawn(player))
        this.world.on("player-chat",        (player, text) => this.onPlayerChat(player, text))
        this.world.on("player-config",      (player, tank, nick) => this.onClientConfig(player, tank, nick))

        this.world.on("tick", () => {
            for(let client of this.portal.clients.values()) {
                let manager = client.data.visibilityManager
                if (!manager.end.hasData()) continue;
                new WorldCommunicationPacket(manager.end.spitBuffer()).sendTo(client.connection)
            }
        })

        if(options.loop) {
            this.loop = options.loop
        } else {
            this.loop = new HighPrecisionLoop({
                interval: this.spt * 1000
            })
        }
        this.loop.run = () => this.tick()
    }

    log(line: string): void {
        if (this.logger) {
            this.logger.log(line)
        }
    }

    terminate() {
        for (let client of this.portal.clients.values()) {
            client.connection.close()
        }
    }

    private onClientConnect(client: GameSocketPortalClient) {
        if (!this.timer) {
            this.log("Player connected, resuming the screen...")
            this.loop.start()
        }

        client.data.visibilityManager.setWorld(this.world)
    }

    private onClientDisconnect(client: GameSocketPortalClient) {
        this.log("Disconnected " + client.id)
        client.data.visibilityManager.setWorld(null)

        if (this.portal.clients.size === 0) {
            this.log("No players, pausing the screen...")
            this.pause()
        }
    }

    private onPlayerJoin(player: ServerPlayer) {
        this.broadcastMessage("§!F00;" + player.nick + "§!; присоединился к игре")
    }

    private onPlayerChangedTank(player: ServerPlayer) {
        this.broadcastMessage("§!F00;" + player.nick + "§!; сменил вооружение")
    }

    private onPlayerLeave(player: ServerPlayer) {
        this.broadcastMessage("§!F00;" + player.nick + "§!; вышел из игры")
    }

    pause() {
        this.loop.stop()
    }

    tick() {
        this.world.tick(this.spt)
        this.ticks++
    }

    onPlayerRespawn(player: ServerPlayer) {
        this.respawnPlayer(player)
    }

    getFreeTeam() {
        let mostUnfilled: Team[] = []
        let minClientCount = Infinity

        for (let i = this.teams.length - 1; i >= 0; i--) {
            const team = this.teams[i]
            const length = team.players.size
            if (length < minClientCount) {
                mostUnfilled = [team]
                minClientCount = length
            } else if (minClientCount === length) {
                mostUnfilled.push(team)
            }
        }

        return mostUnfilled[Math.floor(Math.random() * mostUnfilled.length)]
    }

    private onPlayerChat(player: AbstractPlayer, text: string) {
        text = text.trim()

        if (!text.length) return

        this.broadcastMessage("§!F00;" + player.nick + "§;: " + HTMLEscape(text))
    }

    private broadcastMessage(text: string) {
        this.portal.broadcast(new PlayerChatPacket(text))
    }

    private onClientConfig(client: GameSocketPortalClient, modelId: number, nick: string) {

        let player: ServerPlayer = client.data.player

        if(!player) {
            const team = this.getFreeTeam()

            player = new ServerPlayer({
                id: client.id,
                nick: nick,
                team: team
            })

            team.players.add(player)
            client.data.player = player
        }

        const model = new EntityModel()
        EntityModel.Types.get(modelId)(model)
        const tank = new ServerSniperTank({
            model: model
        })
        const oldTank = player.tank

        this.world.createEntity(tank)
        client.data.visibilityManager.setTank(tank)
        player.setTank(tank)

        this.world.createPlayer(player)
        this.respawnPlayer(player)

        if(oldTank) this.world.removeEntity(oldTank)
    }

    respawnPlayer(player: ServerPlayer) {
        const team = player.team
        const tank = player.tank

        tank.model.getComponent(HealthComponent).setHealth((player.tank.model.constructor as typeof TankModel).getMaximumHealth())

        const spawnPoint = this.world.getComponent(TilemapComponent).map.spawnPointForTeam(team.id)
        const body = tank.model.getComponent(PhysicalComponent).getBody()
        body.SetPosition(spawnPoint)
        body.SetAngle(0)

        const velocity = body.GetLinearVelocity()
        velocity.Set(0, 0)
        body.SetLinearVelocity(velocity)
    }
}