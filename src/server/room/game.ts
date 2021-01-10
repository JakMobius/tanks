import Team from '../team';
import Color from '../../utils/color';
import Player from '../../utils/player';
import ServerTank from '../tanks/servertank';
import ServerGameWorld from '../servergameworld';
import MapPacket from '../../networking/packets/game-packets/mappacket';
import BinaryPacket from '../../networking/binarypacket';
import PlayerJoinPacket from '../../networking/packets/game-packets/playerjoinpacket';
import PlayerSpawnPacket from '../../networking/packets/game-packets/playerspawnpacket';
import TankLocationsPacket from '../../networking/packets/game-packets/gamestatepacket';
import PlayerControlsPacket from '../../networking/packets/game-packets/playercontrolspacket';
import PlayerConfigPacket from '../../networking/packets/game-packets/playerconfigpacket';
import PlayerRespawnPacket from '../../networking/packets/game-packets/playerrespawnpacket';
import PlayerChatPacket from '../../networking/packets/game-packets/playerchatpacket';
import EntityListPacket from '../../networking/packets/game-packets/entitylistpacket';
import EntityCreatePacket from '../../networking/packets/game-packets/entitycreatepacket';
import EntityRemovePacket from '../../networking/packets/game-packets/entityremovepacket';
import BlockUpdatePacket from '../../networking/packets/game-packets/blockupdatepacket';
import PlayerLeavePacket from '../../networking/packets/game-packets/playerleavepacket';
import EffectCreatePacket from '../../networking/packets/game-packets/effectcreatepacket';
import EffectRemovePacket from '../../networking/packets/game-packets/effectremovepacket';
import HTMLEscape from '../../utils/htmlescape';
import HighPreciseLoop from '../../utils/loop/highpreciseloop';
import Room from './room';
import Logger from '../log/logger';
import SocketPortalClient from "../socket/socket-portal-client";
import ServerEntity from "../entity/serverentity";
import ServerEffect from "../effects/servereffect";
import GameMap from "../../utils/map/gamemap";
import Server from "../server";

import 'src/tanks/model-loader'
import 'src/server/entity/bullet/model-loader';
import 'src/server/effects/world/type-loader';
import 'src/server/effects/tank/type-loader';
import 'src/utils/map/blockstate/type-loader';

interface GameConfig {
    name: string
    map: GameMap
    server: Server
}

class Game extends Room {
	public teams = [
        new Team(0, new Color(58, 104, 193)),
        new Team(1, new Color(222, 54, 54)),
        new Team(2, new Color(14, 193, 1))
    ]
	public loop = new HighPreciseLoop();
	public ticks: number = 0;
	public logger: Logger = new Logger();
	public multiplier: number = 1;
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
        this.multiplier = 1
        this.name = options.name
        this.server = options.server

        this.world = new ServerGameWorld({
            map: options.map,
            physicsTick: this.spt,
            maxTicks: 1,
            velocitySteps: 7,
            positionSteps: 5,
            room: this
        })

        this.on(PlayerControlsPacket, (client, packet) => {
            if(client.data.player) {
                packet.updateControls(client.data.player.tank.model.controls)
            }
        })

        this.on(PlayerConfigPacket, (client, packet) => {
            if(!packet.tank) {
                return
            }

            let player = client.data.player

            if(player) {
                player.tank.destroy()
                this.broadcast(new PlayerChatPacket("§!F00;" + client.data.player.nick + "§!; сменил вооружение"))
            } else {
                const team = this.getFreeTeam()

                player = new Player({
                    id: client.id,
                    nick: packet.nick,
                    team: team
                })

                team.players.add(player)
                client.data.player = player
                this.world.createPlayer(player)

                this.broadcast(new PlayerChatPacket("§!F00;" + client.data.player.nick + "§!; присоединился к игре"))
            }

            let tank = new ServerTank({
                type: packet.tank,
                world: this.world
            })

            player.setTank(tank)

            this.respawnPlayer(client)
            this.sendPlayerJoinEvent(this.clients.values(), player)
        })

        this.on(PlayerRespawnPacket, (client) => {
            const p = client.data.player
            if (!p) return

            this.respawnPlayer(client)
        })

        this.on(PlayerChatPacket, (client, packet) => {
            const id = client.id

            if (id === undefined) return
            let text = packet.text.trim()

            if (!text.length) return

            text = "§!F00;" + client.data.player.nick + "§;: " + HTMLEscape(text)

            this.broadcast(new PlayerChatPacket(text))
        })

        this.world.on("entity-create", (entity: ServerEntity) => {
            this.broadcast(new EntityCreatePacket(entity))
        })

        this.world.on("entity-remove", (entity: ServerEntity) => {
            this.broadcast(new EntityRemovePacket(entity))
        })

        this.world.on("effect-create", (effect: ServerEffect) => {
            this.broadcast(new EffectCreatePacket(effect.model))
        })

        this.world.on("effect-remove", (effect: ServerEffect) => {
            if((effect.constructor as typeof ServerEffect).shouldSynchroniseRemoval)
                this.broadcast(new EffectRemovePacket(effect.model.id))
        })

        // TODO: Batch block update packets

        this.world.map.on("block-update", (x: number, y: number) => {
            this.broadcast(new BlockUpdatePacket(x, y, this.world.map.getBlock(x, y)))
        })
    }

    setTPS(tps: number): void {
        this.tps = tps
        this.spt = 1 / this.tps
        this.loop.interval = 1000 / this.tps
    }

    speedupGame(multiplier: number): void {
        this.multiplier = multiplier
    }

    log(line: string): void {
        if (this.logger) {
            this.logger.log(line)
        }
    }

    broadcastPlayers(client: SocketPortalClient): void {
        for (let c of this.clients.values()) {
            if(c.data.player) {
                new PlayerJoinPacket(c.data.player, c.data.player.tank.model).sendTo(client.connection)
            }
        }
    }

    sendPlayerJoinEvent(clients: Iterable<SocketPortalClient>, player: Player) {

        let joinPacket: PlayerJoinPacket | null = null

        for (let c of clients) {
            if (c.data.player != null && c.data.player.id === player.id) {
                let packet = new PlayerSpawnPacket(player, player.tank.model)

                packet.sendTo(c.connection)
            } else {
                if(!joinPacket) {
                    joinPacket = new PlayerJoinPacket(player, player.tank.model)
                }

                joinPacket.sendTo(c.connection)
            }
        }
    }

    terminate() {
        for (let client of this.clients.values()) {
            client.connection.close()
        }
    }

    clientConnected(client: SocketPortalClient) {
        super.clientConnected(client)

        if (!this.timer) {
            this.log("Player connected, resuming the screen...")
            this.loop.start()
        }

        new MapPacket(this.world.map).sendTo(client.connection)
        this.broadcastPlayers(client)

        new EntityCreatePacket(Array.from(this.world.entities.values())).sendTo(client.connection)
    }

    clientDisconnected(client: SocketPortalClient) {
        super.clientDisconnected(client)

        this.log("Disconnected " + client.id)

        const player = client.data.player

        if(!player) return

        client.data.player = null

        if (this.clients.size === 0) {
            this.log("No players, pausing the screen...")
            this.pause()
        }

        this.world.removePlayer(player)
        this.broadcast(new PlayerLeavePacket(player))
        this.broadcast(new PlayerChatPacket("§!F00;" + player.nick + "§!; вышел из игры"))
    }

    pause() {
        this.loop.stop()
    }

    tick() {
        this.world.tick(this.spt)
        this.ticks++

        this.broadcast(new EntityListPacket(this.world.entities))
        this.broadcast(new TankLocationsPacket(this.world.players))
    }

    respawnPlayer(client: SocketPortalClient) {
        const player = client.data.player
        const team = player.team
        const tank: ServerTank = player.tank

        tank.model.health = player.tank.model.constructor.getMaximumHealth()

        const spawnPoint = this.world.map.spawnPointForTeam(team.id)
        tank.model.body.SetPosition(spawnPoint)
        tank.model.body.SetAngle(0)

        const v = player.tank.model.body.GetLinearVelocity()
        v.Set(0, 0)
        tank.teleported = true
        tank.model.body.SetLinearVelocity(v)
    }

    broadcast(msg: BinaryPacket) {
        if(msg.shouldSend())
            for (let client of this.clients.values())
                msg.sendTo(client.connection)
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
}

export default Game;