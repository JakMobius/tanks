const Team = require("../team");
const Color = require("../../utils/color");
const GameMap = require('../../utils/map/gamemap')
const Box2D = require("../../library/box2d")
const Player = require("../../utils/player")
const ServerTank = require("../tanks/servertank")
const ServerGameWorld = require("../servergameworld")

const MapPacket = require("../../networking/packets/mappacket.js")
const BinaryPacket = require("../../networking/binarypacket")
const PlayerJoinPacket = require("../../networking/packets/playerjoinpacket")
const PlayerSpawnPacket = require("../../networking/packets/playerspawnpacket")
const TankLocationsPacket = require("../../networking/packets/gamestatepacket")
const PlayerControlsPacket = require("../../networking/packets/playercontrolspacket")
const PlayerConfigPacket = require("../../networking/packets/playerconfigpacket")
const PlayerRespawnPacket = require("../../networking/packets/playerrespawnpacket")
const PlayerChatPacket = require("../../networking/packets/playerchatpacket")
const EntityListPacket = require("../../networking/packets/entitylistpacket")
const EntityCreatePacket = require("../../networking/packets/entitycreatepacket")
const EntityRemovePacket = require("../../networking/packets/entityremovepacket")
const BlockUpdatePacket = require("../../networking/packets/blockupdatepacket")
const PlayerLeavePacket = require("../../networking/packets/playerleavepacket")
const EffectCreatePacket = require("../../networking/packets/effectcreatepacket")
const EffectRemovePacket = require("../../networking/packets/effectremovepacket")

const HTMLEscape = require("../../utils/htmlescape.js")

const HighPreciseLoop = require("../../utils/loop/highpreciseloop")
const Room = require("./room")
const Logger = require("../log/logger")

require("/src/server/entity/bullet/models/")
require("/src/server/effects/world/types/")
require("/src/server/effects/tank/types/")
require("/src/utils/physicsutils").setupPhysics()

class Game extends Room {

    constructor(options) {
        super()

        this.teams = [
            new Team(0, new Color(58, 104, 193)),
            new Team(1, new Color(222, 54, 54)),
            new Team(2, new Color(14, 193, 1))
        ]

        this.loop = new HighPreciseLoop()
        this.loop.run = () => this.tick()

        this.ticks = 0
        this.setTPS(20)
        this.logger = new Logger()
        this.multiplier = 1
        this.name = options.name

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

        this.world.on("entity-create", entity => {
            this.broadcast(new EntityCreatePacket(entity))
        })

        this.world.on("entity-remove", entity => {
            this.broadcast(new EntityRemovePacket(entity))
        })

        this.world.on("effect-create", (effect) => {
            this.broadcast(new EffectCreatePacket(effect.model))
        })

        this.world.on("effect-remove", (effect) => {
            if(effect.constructor.shouldSynchroniseRemoval)
                this.broadcast(new EffectRemovePacket(effect.model.id))
        })

        // TODO: Batch block update packets

        this.world.map.on("block-update", (x, y) => {
            this.broadcast(new BlockUpdatePacket(x, y, this.world.map.getBlock(x, y)))
        })
    }

    setTPS(tps) {
        this.tps = tps
        this.spt = 1 / this.tps
        this.loop.interval = 1000 / this.tps
        this.bonusCreationInterval = 25 * this.tps
    }

    speedupGame(multiplier) {
        this.multiplier = multiplier
    }

    log(line) {
        if (this.logger) {
            this.logger.log(line)
        }
    }

    broadcastPlayers(client) {
        for (let c of this.clients.values()) {
            if(c.data.player) {
                new PlayerJoinPacket(c.data.player, c.data.player.tank.model).sendTo(client)
            }
        }
    }

    sendPlayerJoinEvent(clients, player) {

        /**
         * @type {PlayerJoinPacket | null}
         */

        let joinPacket = null

        for (let c of clients) {
            if (c.data.player != null && c.data.player.id === player.id) {
                let packet = new PlayerSpawnPacket(player, player.tank.model)

                packet.sendTo(c)
            } else {
                if(!joinPacket) {
                    joinPacket = new PlayerJoinPacket(player, player.tank.model)
                }

                joinPacket.sendTo(c)
            }
        }
    }

    terminate() {
        for (let client of this.clients.values()) {
            client.connection.close()
        }
    }

    clientConnected(client) {
        super.clientConnected(client)

        if (!this.timer) {
            this.log("Player connected, resuming the screen...")
            this.loop.start()
        }

        new MapPacket(this.world.map).sendTo(client)
        this.broadcastPlayers(client)

        new EntityCreatePacket(Array.from(this.world.entities.values())).sendTo(client)
    }

    clientDisconnected(client) {
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

    respawnPlayer(client) {
        const player = client.data.player
        const team = player.team

        player.tank.model.health = player.tank.model.constructor.getMaximumHealth()

        const spawnPoint = this.world.map.spawnPointForTeam(team.id)
        player.tank.model.body.SetPositionAndAngle(spawnPoint, 0)

        const v = player.tank.model.body.GetLinearVelocity()
        v.Set(0, 0)
        player.tank.teleported = true
        player.tank.model.body.SetLinearVelocity(v)
    }

    createExplosion(x, y, power, player) {
        const pos = new Box2D.b2Vec2(x, y)
        const force = power * 10000

        for (let client of this.clients.values()) {
            const p = client.data.player
            if (!p) continue

            const position = p.tank.model.body.GetPosition()

            const dx = position.x - x
            const dy = position.y - y

            let dist = dx ** 2 + dy ** 2

            dist = Math.max(dist, 100)


            const impulse = force / dist // / Math.sqrt(dist)
            const damage = power / Math.sqrt(dist) * 4 - 0.7

            if (damage > 0) {
                p.tank.damage(damage, player)
                p.tank.model.body.ApplyImpulse(new Box2D.b2Vec2(dx * impulse, dy * impulse), pos)
            }
        }

        for (let entity of this.world.entities.values()) {

            const dx = entity.model.x - x
            const dy = entity.model.y - y

            if (dx === 0 && dy === 0) continue;

            const dist = Math.sqrt(dx ** 2 + dy ** 2)

            if (power / (dist + 1) > entity.explodeResistance) {
                (function(self, entity) {
                    self.loop.scheduleTask(() => entity.die(), dist / 200)
                })(this, entity)
            }
        }

        const damageRadius = power / 2

        const cx = x / GameMap.BLOCK_SIZE
        const cy = y / GameMap.BLOCK_SIZE
        const x1 = Math.floor(cx - damageRadius)
        const x2 = Math.ceil(cx + damageRadius)
        const y1 = Math.floor(cy - damageRadius)
        const y2 = Math.ceil(cy + damageRadius)

        for (let bx = x1; bx < x2; bx++) {
            for (let by = y1; by < y2; by++) {
                const b = this.world.map.getBlock(bx, by)

                if (b && b.constructor.isSolid) {
                    const dist = Math.sqrt((by - cy) ** 2 + (bx - cx) ** 2)
                    const damage = (damageRadius / (dist + 1) - 1) * 1000
                    if (damage > 0) {
                        this.world.map.damageBlock(bx, by, damage)
                    }
                }
            }
        }

        //this.broadcast(new MapEffectPacket(x, y, power))
    }

    /**
     *
     * @param msg {BinaryPacket}
     */
    broadcast(msg) {
        if(msg.shouldSend())
            for (let client of this.clients.values())
                msg.sendTo(client)
    }

    playerDead(player) {
        const position = player.tank.model.body.GetPosition()
        this.createExplosion(position.x, position.y, 20)
    }

    getFreeTeam() {
        let mostUnfilled = []
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

module.exports = Game