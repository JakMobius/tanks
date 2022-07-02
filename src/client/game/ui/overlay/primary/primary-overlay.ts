import Overlay, {OverlayConfig} from 'src/client/ui/overlay/overlay';
import ControlsContainer from './controls/controls-container';
import PlayMenuContainer from './play-menu/play-menu-container';
import TankPreviewContainer from './tank-preview/tank-preview-container';
import TankSelectContainer from './tank-select/tank-select-container';
import RoomListRequestPacket from 'src/networking/packets/game-packets/room-list-request-packet';
import RoomSelectContainer from './room-select/room-select-container';
import GameScene from "../../../scenes/game-scene";

export interface PrimaryOverlayConfig extends OverlayConfig {
    game: GameScene
}

export default class PrimaryOverlay extends Overlay {
	public game: GameScene;
	public menuContainer: JQuery;
	public steeringContainer: JQuery;
	public playMenu: PlayMenuContainer;
	public steeringShown: boolean;
	public tankSelectMenu: TankSelectContainer;
	public steeringMenu: ControlsContainer;
	public roomSelectContainer: RoomSelectContainer;
	public selectedTank: any;
	public tankPreviewMenu: TankPreviewContainer;

    constructor(options: PrimaryOverlayConfig) {
        super(options)
        this.game = options.game

        this.menuContainer = $("<div>")
        this.steeringContainer = $("<div>").hide()

        this.overlay.append(this.menuContainer)
        this.overlay.append(this.steeringContainer)

        this.createTankPreviewMenu()
        this.createPlayMenu()
        this.createServerDropdown()
        this.createTankSelectContainer()
        this.createSteeringContainer()
    }

    shouldShowSteering(): boolean {
        return localStorage.getItem("showHints") !== "0"
    }

    setShouldShowSteering(value: boolean): void {
        localStorage.setItem("showHints", value ? "1" : "0")
    }

    createPlayMenu(): void {

        this.playMenu = new PlayMenuContainer()

        this.playMenu.on("play", () => {
            if(this.shouldShowSteering() && !this.steeringShown) {
                this.steeringShown = true

                this.menuContainer.fadeOut(() => {
                    this.steeringContainer.fadeIn(300)
                })
            } else {
                this.emitPlay()
                this.hide()
            }
        })

        this.menuContainer.append(this.playMenu.element)
    }

    emitPlay(): void {
        this.emit("play", this.playMenu.nickInput.val())
    }

    createSteeringContainer(): void {
        this.steeringMenu = new ControlsContainer()
        this.steeringMenu.on("confirm", (disable: boolean) => {
            this.setShouldShowSteering(!disable)
            this.hide(() => {
                this.steeringContainer.hide()
                this.menuContainer.show()
            })
            this.emitPlay()
        })

        this.steeringContainer.append(this.steeringMenu.element)
    }

    createServerDropdown(): void {
        this.roomSelectContainer = new RoomSelectContainer()
        this.menuContainer.append(this.roomSelectContainer.element)
    }

    createTankSelectContainer(): void {
        this.tankSelectMenu = new TankSelectContainer()
        // this.tankSelectMenu.on("select", (tank) => this.selectTank(tank))
        // this.selectTank(this.tankSelectMenu.selectedTank)
        this.menuContainer.append(this.tankSelectMenu.element)
    }

    selectTank(tank: any): void {
        this.selectedTank = tank
        this.tankPreviewMenu.previewTank(tank)
    }

    createTankPreviewMenu(): void {
        this.tankPreviewMenu = new TankPreviewContainer()
        this.menuContainer.append(this.tankPreviewMenu.element)
    }

    show(): void {
        if(this.shown) return
        super.show()
        new RoomListRequestPacket(true).sendTo(this.game.client.connection)
        // this.tankSelectMenu.loop.start()
    }

    hide(callback?: () => void): void {
        if(!this.shown) return
        super.hide(callback)

        new RoomListRequestPacket(false).sendTo(this.game.client.connection)
        // this.tankSelectMenu.loop.stop()
    }
}