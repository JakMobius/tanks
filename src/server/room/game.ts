import Team from '../team';
import Color from '../../utils/color';
import ServerTank from '../tanks/servertank';
import ServerGameWorld from '../servergameworld';
import HighPrecisionLoop from '../../utils/loop/highpreciseloop';
import Room from './room';
import Logger from '../log/logger';
import SocketPortalClient from "../socket/socket-portal-client";
import GameMap from "../../utils/map/gamemap";
import Server from "../server";

import 'src/tanks/model-loader'
import 'src/server/entity/bullet/model-loader';
import 'src/server/effects/world/type-loader';
import 'src/server/effects/tank/type-loader';
import 'src/utils/map/blockstate/type-loader';
import HTMLEscape from "../../utils/htmlescape";
import PlayerChatPacket from "../../networking/packets/game-packets/playerchatpacket";
import Player from "../../utils/player";
import TankModel from "../../tanks/tankmodel";
import ServerPlayer from "../server-player";

interface GameConfig {
    name: string
    map: GameMap
    server: Server
}

export default class Game extends Room {
    public teams = [
        new Team(0, new Color(58, 104, 193)),
        new Team(1, new Color(222, 54, 54)),
        new Team(2, new Color(14, 193, 1))
    ]
    public loop = new HighPrecisionLoop();
    public ticks: number = 0;
    public logger: Logger = new Logger();
    public world: ServerGameWorld;
    public spt: number;
    public tps: number;
    public timer: number;

    constructor(options: GameConfig) {
        super()

        this.loop.run = () => this.tick()

        this.ticks = 0
        this.setTPS(20)
        this.logger = new Logger()
        this.name = options.name

        this.world = new ServerGameWorld({
            map: options.map,
            room: this
        })

        this.portal.on("client-connect", () => this.onClientConnect())
        this.portal.on("client-disconnect", (client) => this.onClientDisconnect(client))

        this.world.on("player-respawn", (player) => this.onPlayerRespawn(player))
        this.world.on("player-chat", (player, text) => this.onPlayerChat(player, text))
        this.world.on("player-config", (player, tank, nick) => this.onClientConfig(player, tank, nick))
    }

    setTPS(tps: number): void {
        this.tps = tps
        this.spt = 1 / this.tps
        this.loop.interval = 1000 / this.tps
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

    onClientConnect() {
        if (!this.timer) {
            this.log("Player connected, resuming the screen...")
            this.loop.start()
        }
    }

    onClientDisconnect(client: SocketPortalClient) {
        this.log("Disconnected " + client.id)

        if (this.portal.clients.size === 0) {
            this.log("No players, pausing the screen...")
            this.pause()
        }

        const player = client.data.player
        if(player) {
            client.data.player = null
            this.world.removePlayer(player)
        }
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

    private onPlayerChat(player: Player, text: string) {
        text = text.trim()

        if (!text.length) return

        this.broadcastMessage("§!F00;" + player.nick + "§;: " + HTMLEscape(text))
    }

    private broadcastMessage(text: string) {
        this.portal.broadcast(new PlayerChatPacket(text))
    }

    private onClientConfig(client: SocketPortalClient, model: typeof TankModel, nick: string) {
        let player: ServerPlayer = client.data.player

        if(player) {
            player.tank.destroy()
            this.broadcastMessage("§!F00;" + player.nick + "§!; сменил вооружение")
        } else {
            const team = this.getFreeTeam()

            player = new ServerPlayer({
                id: client.id,
                nick: nick,
                team: team
            })

            team.players.add(player)
            client.data.player = player
            this.world.createPlayer(player)

            this.broadcastMessage("§!F00;" + player.nick + "§!; присоединился к игре")
        }

        let tank = new ServerTank({ type: model })

        player.setTank(tank)

        this.respawnPlayer(player)
    }

    private respawnPlayer(player: ServerPlayer) {
        const team = player.team
        const tank = player.tank

        tank.model.health = (player.tank.model.constructor as typeof TankModel).getMaximumHealth()

        const spawnPoint = this.world.map.spawnPointForTeam(team.id)
        tank.model.body.SetPosition(spawnPoint)
        tank.model.body.SetAngle(0)

        const velocity = player.tank.model.body.GetLinearVelocity()
        velocity.Set(0, 0)
        tank.teleported = true
        tank.model.body.SetLinearVelocity(velocity)
    }
}