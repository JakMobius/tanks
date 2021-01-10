
import * as Box2D from 'src/library/box2d';
import Scene, {SceneConfig} from 'src/client/scenes/scene';
import GameMap from 'src/utils/map/gamemap';
import ClientEntity from 'src/client/entity/cliententity';
import ClientTank from 'src/client/tanks/clienttank';
import EventContainer from 'src/client/ui/overlay/events/eventcontainer';
import ClientGameWorld from 'src/client/clientgameworld';
import BrowserClient from 'src/client/networking/browser-client';
import MapPacket from 'src/networking/packets/game-packets/mappacket';
import PlayerJoinPacket from 'src/networking/packets/game-packets/playerjoinpacket';
import PlayerSpawnPacket from 'src/networking/packets/game-packets/playerspawnpacket';
import TankLocationsPacket from 'src/networking/packets/game-packets/gamestatepacket';
import PlayerControlsPacket from 'src/networking/packets/game-packets/playercontrolspacket';
import PlayerConfigPacket from 'src/networking/packets/game-packets/playerconfigpacket';
import PlayerChatPacket from 'src/networking/packets/game-packets/playerchatpacket';
import PlayerRespawnPacket from 'src/networking/packets/game-packets/playerrespawnpacket';
import EntityCreatePacket from 'src/networking/packets/game-packets/entitycreatepacket';
import EntityRemovePacket from 'src/networking/packets/game-packets/entityremovepacket';
import EntityListPacket from 'src/networking/packets/game-packets/entitylistpacket';
import BlockUpdatePacket from 'src/networking/packets/game-packets/blockupdatepacket';
import PlayerLeavePacket from 'src/networking/packets/game-packets/playerleavepacket';
import RoomListPacket from 'src/networking/packets/game-packets/roomlistpacket';
import PlayerRoomRequestPacket from 'src/networking/packets/game-packets/playerroomrequestpacket';
import PlayerRoomChangePacket from 'src/networking/packets/game-packets/playerroomchangepacket';
import EffectCreatePacket from 'src/networking/packets/game-packets/effectcreatepacket';
import EffectRemovePacket from 'src/networking/packets/game-packets/effectremovepacket';
import WorldEffectModel from 'src/effects/world/world-effect-model';
import TankEffectModel from 'src/effects/tank/tankeffectmodel';
import ClientTankEffect from 'src/client/effects/tank/clienttankeffect';
import ClientWorldEffect from 'src/client/effects/world/clientworldeffect';
import ControlPanel from '../ui/controlpanel';
import Camera from 'src/client/camera';
import Keyboard from 'src/client/controls/interact/keyboardcontroller';
import PrimaryOverlay from '../ui/overlay/primary/primaryoverlay';
import ChatContainer from '../ui/overlay/chat/chatcontainer';
import TouchController from 'src/client/controls/interact/touchcontroller';
import PlayerControls from 'src/client/controls/playercontrols';
import GamepadManager from 'src/client/controls/interact/gamepadmanager';
import MapDrawer from 'src/client/graphics/drawers/mapdrawer';
import ParticleProgram from 'src/client/graphics/programs/particleprogram';
import TextureProgram from 'src/client/graphics/programs/textureprogram';
import ExplodePoolDrawer from 'src/client/graphics/drawers/explodepooldrawer';
import TankModel from "src/tanks/tankmodel";
import AbstractTank from "src/tanks/abstracttank";
import AbstractClient from "src/networking/abstract-client";
import Player from "src/utils/player";
import KeyboardController from "src/client/controls/interact/keyboardcontroller";
import ClientEffect from "../../effects/clienteffect";
import GameScreen from "../game-screen";
import SoundEngine from "../../sound/soundengine";

export interface GameSceneConfig extends SceneConfig {
    screen: GameScreen,
    bgscale?: number,
    ip: string
}

class GameScene extends Scene {
	public config: GameSceneConfig;
	public controlsUpdateInterval: number;
	public camera: Camera;
	public keyboard: KeyboardController;
	public controls: ControlPanel;
	public gamepad: GamepadManager;
	public touchController: TouchController;
	public playerControls: PlayerControls;
	public client: AbstractClient;
	public alive: boolean;
	public mapDrawer: MapDrawer;
	public particleProgram: ParticleProgram;
	public entityProgram: TextureProgram;
	public explodePoolDrawer: ExplodePoolDrawer;
	public overlay: PrimaryOverlay;
	public eventContainer: EventContainer;
	public chatContainer: ChatContainer;
	public effects: Map<number, ClientEffect>;
	public timer: number;
    public world: ClientGameWorld

    constructor(config: GameSceneConfig) {
        super(config)

        this.config = config

        this.config.bgscale = this.config.bgscale || 2
        this.controlsUpdateInterval = 0.1 // seconds

        this.camera = new Camera({
            baseScale: 3,
            viewport: new Box2D.Vec2(this.screen.width, this.screen.height),
            defaultPosition: new Box2D.Vec2(0, 0),
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
                new PlayerRespawnPacket().sendTo(this.client.connection)
            }
        })

        this.keyboard.startListening()
        this.touchController.startListening()
        this.gamepad.startListening()

        this.setupUpdateLoop()

        this.alive = false
        this.client = new BrowserClient({ ip: config["ip"] })

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

    private initOverlay() {
        this.overlay = new PrimaryOverlay({
            root: this.overlayContainer,
            game: this
        })

        this.overlay.on("play", (nick: string, tank: typeof AbstractTank) => {
            if(this.world && this.world.player) {
                if(tank.getModel().getId() === (this.world.player.tank.model.constructor as typeof TankModel).getId()) {
                    return
                }
            }

            new PlayerConfigPacket(nick, tank.getModel()).sendTo(this.client.connection)
        })

        this.overlay.roomSelectContainer.on("select", (room: string) => {
            new PlayerRoomRequestPacket(room).sendTo(this.client.connection)
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

    private initEvents() {
        this.eventContainer = new EventContainer()
        this.overlayContainer.append(this.eventContainer.element)
    }

    private setupUpdateLoop() {
        const update = () => {
            this.screen.loop.scheduleTask(update, this.controlsUpdateInterval)
            if(this.world && this.world.player && this.world.player.tank.model.controls.shouldUpdate()) {
                new PlayerControlsPacket(this.world.player.tank.model.controls).sendTo(this.client.connection)
            }
        }

        update()
    }

    private newPlayer(player: Player, tank: TankModel) {
        this.world.createPlayer(player)

        let newTank = ClientTank.fromModel(tank)

        player.setTank(newTank)
        player.tank.world = this.world
        player.tank.model.initPhysics(this.world.world)

        newTank.setupDrawer(this.screen.ctx)

        return player
    }

    private connect() {
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

                let tank: ClientTank = player.tank as ClientTank

                let wrapper = ClientTankEffect.fromModelAndTank(effect, tank)
                tank.effects.set(effect.id, wrapper)

                this.effects.set(effect.id, wrapper)
            } else if(effect instanceof WorldEffectModel) {
                let wrapper = ClientWorldEffect.fromModelAndWorld(effect, this.world)
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

    private createChat() {
        this.chatContainer = new ChatContainer()
        this.overlayContainer.append(this.chatContainer.element)

        this.keyboard.keybinding("Enter", () => {
            if(this.world && this.world.player) {
                this.chatContainer.showInput()
            }
        })

        this.chatContainer.on("chat", (text: string) => new PlayerChatPacket(text).sendTo(this.client.connection))
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

    draw(ctx: WebGLRenderingContext, dt: number) {

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
        this.drawParticles()

        // Post-processing

        this.screen.setScreenFramebuffer()
        this.screen.clear()

        this.explodePoolDrawer.draw(this.world.explosionEffectPool, dt)

        this.world.tick(dt)
    }

    private drawParticles() {
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

    private drawPlayers(dt: number) {
        let players = this.world.players
        for(let player of players.values()) {
            (player.tank as ClientTank).drawer.draw(this.camera, dt)
        }
    }

    private drawEntities() {
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

export default GameScene;