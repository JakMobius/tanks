
const Overlay = require("/src/client/ui/overlay/overlay")
const ControlsContainer = require("./controls/controlscontainer")
const PlayMenuContainer = require("./play-menu/playmenucontainer")
const TankPreviewContainer = require("./tank-preview/tankpreviewcontainer")
const TankSelectContainer = require("./tank-select/tankselectcontainer")
const RoomListRequestPacket = require("/src/networking/packets/roomlistrequestpacket")
const RoomSelectContainer = require("./room-select/roomselectcontainer")

class PrimaryOverlay extends Overlay {

    constructor(options) {
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

    shouldShowSteering() {
        return localStorage.getItem("showHints") !== "0"
    }

    setShouldShowSteering(value) {
        localStorage.setItem("showHints", value ? "1" : "0")
    }

    createPlayMenu() {

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

    emitPlay() {
        this.emit("play", this.playMenu.nickInput.val(), this.tankSelectMenu.selectedTank)
    }

    createSteeringContainer() {
        this.steeringMenu = new ControlsContainer()
        this.steeringMenu.on("confirm", (disable) => {
            this.setShouldShowSteering(!disable)
            this.hide(() => {
                this.steeringContainer.hide()
                this.menuContainer.show()
            })
            this.emitPlay()
        })

        this.steeringContainer.append(this.steeringMenu.element)
    }

    createServerDropdown() {
        this.roomSelectContainer = new RoomSelectContainer()
        this.menuContainer.append(this.roomSelectContainer.element)
    }

    createTankSelectContainer() {
        this.tankSelectMenu = new TankSelectContainer()
        this.tankSelectMenu.on("select", (tank) => this.selectTank(tank))
        this.selectTank(this.tankSelectMenu.selectedTank)
        this.menuContainer.append(this.tankSelectMenu.element)
    }

    selectTank(tank) {
        this.selectedTank = tank
        this.tankPreviewMenu.previewTank(tank)
    }

    createTankPreviewMenu() {
        this.tankPreviewMenu = new TankPreviewContainer()
        this.menuContainer.append(this.tankPreviewMenu.element)
    }

    show() {
        if(this.shown) return
        super.show()
        this.game.client.send(new RoomListRequestPacket(true))
        this.tankSelectMenu.loop.start()
    }

    hide(callback) {
        if(!this.shown) return
        super.hide(callback)
        this.game.client.send(new RoomListRequestPacket(false))
        this.tankSelectMenu.loop.stop()
    }
}

module.exports = PrimaryOverlay