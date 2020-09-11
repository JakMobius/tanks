
const Box2D = require("/src/library/box2d")

const Scene = require("../../scenes/scene")
const GameMap = require("../../../utils/map/gamemap.js")
const ClientEntity = require("../../entity/cliententity")
const ClientTank = require("../../tanks/clienttank.js")
const EventContainer = require("../../ui/overlay/events/eventcontainer")
const ClientGameWorld = require("/src/client/game/clientgameworld")

const MapPacket = require("/src/networking/packets/mappacket")
const PlayerJoinPacket = require("/src/networking/packets/playerjoinpacket")
const PlayerSpawnPacket = require("/src/networking/packets/playerspawnpacket")
const TankLocationsPacket = require("/src/networking/packets/gamestatepacket")
const PlayerControlsPacket = require("/src/networking/packets/playercontrolspacket")
const PlayerConfigPacket = require("/src/networking/packets/playerconfigpacket")
const PlayerChatPacket = require("/src/networking/packets/playerchatpacket")
const PlayerRespawnPacket = require("/src/networking/packets/playerrespawnpacket")
const EntityCreatePacket = require("/src/networking/packets/entitycreatepacket")
const EntityRemovePacket = require("/src/networking/packets/entityremovepacket")
const EntityListPacket = require("/src/networking/packets/entitylistpacket")
const BlockUpdatePacket = require("/src/networking/packets/blockupdatepacket")
const PlayerLeavePacket = require("/src/networking/packets/playerleavepacket")
const RoomListPacket = require("/src/networking/packets/roomlistpacket")
const PlayerRoomRequestPacket = require("/src/networking/packets/playerroomrequestpacket")
const PlayerRoomChangePacket = require("/src/networking/packets/playerroomchangepacket")
const EffectCreatePacket = require("/src/networking/packets/effectcreatepacket")
const EffectRemovePacket = require("/src/networking/packets/effectremovepacket")

const WorldEffectModel = require("/src/effects/world/worldeffectmodel")
const TankEffectModel = require("/src/effects/tank/tankeffectmodel")
const ClientTankEffect = require("/src/client/effects/tank/clienttankeffect")
const ClientWorldEffect = require("/src/client/effects/world/clientworldeffect")
const ControlPanel = require("../ui/controlpanel")
const Client = require("../../networking/client")
const Camera = require("../../camera")
const Keyboard = require("../../controls/interact/keyboardcontroller.js")
const PrimaryOverlay = require("../ui/overlay/primary/primaryoverlay")
const ChatContainer = require("../ui/overlay/chat/chatcontainer")
const TouchController = require("../../controls/interact/touchcontroller")
const PlayerControls = require("../../controls/playercontrols")
const GamepadManager = require("../../controls/interact/gamepadmanager")

const MapDrawer = require("../../graphics/drawers/mapdrawer")
const ParticleProgram = require("../../graphics/programs/particleprogram")
const TextureProgram = require("../../graphics/programs/textureprogram")
const ExplodePoolDrawer = require("../../graphics/drawers/explodepooldrawer")

class GameScene extends Scene {

    /**
     * @type ClientGameWorld
     */
    world

    constructor(config) {
        super(config)

        this.config = config

        this.config.bgscale = this.config.bgscale || 2
        this.controlsUpdateInterval = 0.1 // seconds

        this.camera = new Camera({
            baseScale: 3,
            viewport: new Box2D.b2Vec2(this.screen.width, this.screen.height),
            defaultPosition: new Box2D.b2Vec2(0, 0),
            inertial: true
        })

        this.keyboard = new Keyboard()
        this.controls = new ControlPanel()
        this.gamepad = new GamepadManager()

        this.touchController = new TouchController(this.controls, this.screen.canvas)
        this.playerControls = new PlayerControls()
        this.playerControls.setupKeyboard(this.keyboard)
        this.playerControls.setupGamepad(this.gamepad)

        this.playerControls.on("respawn", () => {
            if (this.world && this.world.player.tank) {
                this.client.send(new PlayerRespawnPacket())
            }
        })

        this.keyboard.startListening()
        this.touchController.startListening()
        this.gamepad.startListening()

        this.setupUpdateLoop()

        this.alive = false
        this.client = new Client({ ip: this.screen.config["ip"] })

        this.mapDrawer = new MapDrawer(this.camera, this.screen.ctx)
        this.particleProgram = new ParticleProgram("particle-drawer-program", this.screen.ctx)
        this.entityProgram = new TextureProgram("entity-drawer", this.screen.ctx)
        this.explodePoolDrawer = new ExplodePoolDrawer(this.camera, this.screen)

        this.createChat()
        this.initOverlay()
        this.initEvents()
        this.connect()
        this.layout()

        this.overlay.show()
    }

    initOverlay() {
        this.overlay = new PrimaryOverlay({
            root: this.overlayContainer,
            game: this
        })

        this.overlay.on("play", (nick, tank) => {
            if(this.world && this.world.player) {
                if(tank.getModel().getId() === this.world.player.tank.model.constructor.getId()) {
                    return
                }
            }

            this.client.send(new PlayerConfigPacket(nick, tank.getModel()))
        })

        this.overlay.roomSelectContainer.on("select", (room) => {
            this.client.send(new PlayerRoomRequestPacket(room))
        })

        this.keyboard.keybinding("Escape", () => {
            if(this.world && this.world.player) {
                if (this.overlay.shown) {
                    this.overlay.hide()
                } else {
                    this.overlay.show()
                }
            }
        })
    }

    initEvents() {
        this.eventContainer = new EventContainer()
        this.overlayContainer.append(this.eventContainer.element)
    }

    setupUpdateLoop() {
        const update = () => {
            this.screen.loop.scheduleTask(update, this.controlsUpdateInterval)
            if(this.world && this.world.player && this.world.player.tank.model.controls.shouldUpdate()) {
                this.client.send(new PlayerControlsPacket(this.world.player.tank.model.controls))
            }
        }

        update()
    }

    newPlayer(player, tank) {
        this.world.createPlayer(player)

        player.setTank(ClientTank.fromModel(tank))
        player.tank.world = this.world
        player.tank.setupDrawer(this.screen.ctx)
        player.tank.model.initPhysics(this.world.world)

        return player
    }

    connect() {
        this.client.connectToServer()

        this.client.on(MapPacket, (packet) => {
            if(this.world) return

            this.camera.defaultPosition.x = packet.map.width / 2 * GameMap.BLOCK_SIZE
            this.camera.defaultPosition.y = packet.map.height / 2 * GameMap.BLOCK_SIZE

            if(this.world === null) {
                this.camera.reset()
            }
            this.world = new ClientGameWorld({
                map: packet.map
            })
        })

        this.client.on(PlayerJoinPacket, (packet) => {
            this.newPlayer(packet.player, packet.tank)
        })

        this.client.on(PlayerSpawnPacket, (packet) => {
            const player = this.newPlayer(packet.player, packet.tank)

            this.playerControls.connectTankControls(player.tank.model.controls)
            this.camera.target = player.tank.model.body.GetPosition()
            this.camera.targetVelocity = player.tank.model.body.GetLinearVelocity()
            this.world.player = player
            this.overlay.hide()
        })

        this.client.on(TankLocationsPacket, (packet) => {
            packet.updateTankLocations(this.world.players)
        })

        this.client.on(PlayerChatPacket, (packet) => {
            this.chatContainer.addMessage(packet.text)
        })

        this.client.on(EntityListPacket, (packet) => {
            packet.updateEntities(this.world.entities)
        })

        this.client.on(EntityCreatePacket, (packet) => {
            packet.createEntities((model) => {
                let wrapper = ClientEntity.fromModel(model)
                if(wrapper) this.world.entities.set(model.id, wrapper)
            })
        })

        this.client.on(EntityRemovePacket, (packet) => {
            packet.updateEntities(this.world.entities)
        })

        this.client.on(BlockUpdatePacket, (packet) => {
            this.world.map.setBlock(packet.x, packet.y, packet.block)
            this.mapDrawer.reset()
        })

        this.client.on(PlayerLeavePacket, (packet) => {
            const player = this.world.players.get(packet.playerId)
            this.world.removePlayer(player)
        })

        this.client.on(RoomListPacket, (packet) => {
            this.overlay.roomSelectContainer.updateRooms(packet.rooms)
        })

        this.client.on(PlayerRoomChangePacket, (packet) => {
            if(packet.error) {
                let event = "Не удалось подключиться к игре '" + packet.room + "': " + packet.error
                this.eventContainer.createEvent(event)
            } else {
                this.playerControls.disconnectTankControls()

                this.world = null
                this.chatContainer.clear()

                this.overlay.roomSelectContainer.selectRoom(packet.room)
            }
        })

        this.effects = new Map()

        this.client.on(EffectCreatePacket, (packet) => {
            let effect = packet.effect
            if(this.effects.has(effect.id))
                this.effects.get(effect.id).die()

            if(effect instanceof TankEffectModel) {
                let player = this.world.players.get(effect.tankId)
                if (!player || !player.tank) return

                let tank = /** @type ClientTank */ player.tank

                let wrapper = ClientTankEffect.fromModel(effect, tank)
                tank.effects.set(effect.id, wrapper)
                this.effects.set(effect.id, wrapper)
            } else if(effect instanceof WorldEffectModel) {
                let wrapper = ClientWorldEffect.fromModel(effect, this.world)
                this.world.effects.set(effect.id, wrapper)
                this.effects.set(effect.id, wrapper)
            }
        })

        this.client.on(EffectRemovePacket, (packet) => {
            let effect = this.effects.get(packet.id)
            effect.die()
            this.effects.delete(packet.id)

            if(effect.model instanceof TankEffectModel) {
                let player = this.world.players.get(effect.model.tankId)
                if (!player || !player.tank) return

                let tank = /** @type ClientTank */ player.tank
                tank.effects.delete(packet.id)
            } else if(effect.model instanceof WorldEffectModel) {
                this.world.effects.delete(packet.id)
            }
        })
    }

    layout() {
        this.camera.viewport.x = this.screen.width
        this.camera.viewport.y = this.screen.height
    }

    createChat() {
        this.chatContainer = new ChatContainer()
        this.overlayContainer.append(this.chatContainer.element)

        this.keyboard.keybinding("Enter", () => {
            if(this.world && this.world.player) {
                this.chatContainer.showInput()
            }
        })

        this.chatContainer.on("chat", (text) => this.client.send(new PlayerChatPacket(text)))
        this.chatContainer.on("input-focus", () => {
            this.keyboard.stopListening()
        })
        this.chatContainer.on("input-blur", () => {
            this.keyboard.startListening()
            this.screen.canvas.focus()
        })
    }

    pause() {
        cancelAnimationFrame(this.timer)
    }

    draw(ctx, dt) {

        this.gamepad.refresh()
        this.playerControls.refresh()

        if(!this.world) {
            return
        }

        this.screen.swapFramebuffers()
        this.screen.clear()

        // Drawing the scene

        this.camera.tick(dt)
        this.drawEntities()
        this.mapDrawer.draw(this.world.map)
        this.drawPlayers(dt)
        this.drawParticles(dt)

        // Post-processing

        this.screen.setScreenFramebuffer()
        this.screen.clear()

        this.explodePoolDrawer.draw(this.world.explosionEffectPool, dt)

        this.world.tick(dt)
    }

    drawParticles() {
        if(this.world.particles.length) {
            this.particleProgram.use()
            this.particleProgram.prepare()

            for(let particle of this.world.particles) {
                this.particleProgram.drawParticle(particle)
            }

            this.particleProgram.matrixUniform.setMatrix(this.camera.matrix.m)
            this.particleProgram.draw()
        }
    }

    drawPlayers(dt) {
        let players = this.world.players
        for(let player of players.values()) {
            player.tank.drawer.draw(this.camera, dt)
        }
    }

    drawEntities() {
        let entities = this.world.entities
        if(entities.size > 0) {
            this.entityProgram.use()
            this.entityProgram.prepare()

            for(let entity of entities.values()) {
                entity.drawer.draw(this.entityProgram)
            }

            this.entityProgram.matrixUniform.setMatrix(this.camera.matrix.m)
            this.entityProgram.draw()
        }
    }
}

module.exports = GameScene