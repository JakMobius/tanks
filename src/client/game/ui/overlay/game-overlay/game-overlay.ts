import Overlay, {OverlayConfig} from "../../../../ui/overlay/overlay";
import Entity from "../../../../../utils/ecs/entity";
import GameStateView from "./game-state-view";
import {Constructor} from "../../../../../serialization/binary/serializable";

export interface GameOverlayConfig extends OverlayConfig {
    world: Entity
}

export default class GameOverlay extends Overlay {
    world: Entity

    stateView: GameStateView | null = null

    constructor(options: GameOverlayConfig) {
        super(options);
        this.world = options.world
    }

    setData(data: any) {}

    protected setView(clazz?: null): null
    protected setView<T extends GameStateView>(clazz: Constructor<T>): T
    protected setView<T extends GameStateView>(clazz: Constructor<T> | null): T | null {
        if(!clazz) {
            if(this.stateView) {
                this.stateView.hide()
                this.stateView.onDetach()
                this.stateView = null
            }
            return null
        } else {
            if(this.stateView instanceof clazz) {
                return this.stateView
            } else {
                if(this.stateView) {
                    this.stateView.hide()
                    this.stateView.onDetach()
                }
                this.stateView = new clazz(this)
                this.overlay.append(this.stateView.element)
                this.stateView.onAttach()
            }
        }
        return this.stateView as T
    }
}