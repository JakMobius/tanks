
import ServerGameWorld from '../server-game-world';
import HighPrecisionLoop from '../../utils/loop/high-precision-loop';
import Room from './room';
import Logger from '../log/logger';
import GameMap from "../../map/game-map";

import 'src/entity/model-loader'
import 'src/server/entity/type-loader'
import 'src/server/effects/type-loader';
import 'src/map/block-state/type-loader';

import HTMLEscape from "../../utils/html-escape";
import PlayerChatPacket from "../../networking/packets/game-packets/player-chat-packet";
import AbstractPlayer from "../../abstract-player";
import ServerPlayer from "../server-player";
import Loop from "../../utils/loop/loop";
import ServerWorldBridge from "../server-world-bridge";
import ServerEntity from "../entity/server-entity";
import PhysicalComponent from "../../entity/components/physics-component";
import TilemapComponent from "../../physics/tilemap-component";
import HealthComponent from "../../entity/components/health-component";
import WorldCommunicationPacket from "../../networking/packets/game-packets/world-communication-packet";
import {GameSocketPortalClient} from "../socket/game-server/game-socket-portal";
import EntityModel from "../../entity/entity-model";

interface GameConfig {
    name: string
    map: GameMap
    loop?: Loop
}

export default class Game extends Room {
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
        client.data.visibilityManager.setTank(null)
        client.data.visibilityManager.setWorld(null)

        if (this.portal.clients.size === 0) {
            this.log("No players, pausing the screen...")
            this.pause()
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
        this.respawnPlayer(player.tank)
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
            player = new ServerPlayer({
                id: client.id,
                nick: nick,
            })

            client.data.player = player
        }

        const tank = new EntityModel()
        ServerEntity.types.get(modelId)(tank)
        this.world.appendChild(tank)
        tank.emit("respawn")

        client.data.visibilityManager.setTank(tank)
        player.setTank(tank)
        this.respawnPlayer(tank)
    }

    respawnPlayer(tank: EntityModel) {
        tank.emit("respawn")

        const map = this.world.getComponent(TilemapComponent).map

        const spawnPoint = map.spawnPointForTeam(Math.floor(Math.random() * map.spawnZones.length))

        const body = tank.getComponent(PhysicalComponent)
        body.setPosition(spawnPoint)
        body.setAngle(0)
        body.setVelocity({x: 0, y: 0})
        body.setAngularVelocity(0)
    }
}