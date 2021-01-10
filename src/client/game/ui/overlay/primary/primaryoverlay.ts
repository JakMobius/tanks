
import Overlay, {OverlayConfig} from 'src/client/ui/overlay/overlay';
import ControlsContainer from './controls/controlscontainer';
import PlayMenuContainer from './play-menu/playmenucontainer';
import TankPreviewContainer from './tank-preview/tankpreviewcontainer';
import TankSelectContainer from './tank-select/tankselectcontainer';
import RoomListRequestPacket from 'src/networking/packets/game-packets/roomlistrequestpacket';
import RoomSelectContainer from './room-select/roomselectcontainer';
import GameScene from "../../../scenes/gamescene";
import TankModel from "../../../../../tanks/tankmodel";
import ClientTank from "../../../../tanks/clienttank";

export interface PrimaryOverlayConfig extends OverlayConfig {
    game: GameScene
}

class PrimaryOverlay extends Overlay {
	public shown: boolean;
	public game: GameScene;
	public menuContainer: JQuery;
	public steeringContainer: JQuery;
	public playMenu: PlayMenuContainer;
	public steeringShown: boolean;
	public tankSelectMenu: TankSelectContainer;
	public steeringMenu: ControlsContainer;
	public roomSelectContainer: RoomSelectContainer;
	public selectedTank: typeof ClientTank;
	public tankPreviewMenu: TankPreviewContainer;

    constructor(options: PrimaryOverlayConfig) {
        super(options)
        this.shown = false
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
        this.emit("play", this.playMenu.nickInput.val(), this.tankSelectMenu.selectedTank)
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
        this.tankSelectMenu.on("select", (tank: typeof ClientTank) => this.selectTank(tank))
        this.selectTank(this.tankSelectMenu.selectedTank)
        this.menuContainer.append(this.tankSelectMenu.element)
    }

    selectTank(tank: typeof ClientTank): void {
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
        this.tankSelectMenu.loop.start()
    }

    hide(callback?: () => void): void {
        if(!this.shown) return
        super.hide(callback)

        new RoomListRequestPacket(false).sendTo(this.game.client.connection)
        this.tankSelectMenu.loop.stop()
    }
}

export default PrimaryOverlay;