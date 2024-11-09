import GameStateView from "src/client/ui/overlay/game-overlay/game-state-view";
import {Constructor} from "src/utils/constructor"
import GameOverlay from "src/client/ui/overlay/game-overlay/game-overlay";

export default class GameStateOverlay extends GameOverlay {
    stateView: GameStateView | null = null

    protected setStateView(clazz?: null): null
    protected setStateView<T extends GameStateView>(clazz: Constructor<T>): T
    protected setStateView<T extends GameStateView>(clazz: Constructor<T> | null): T | null {
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
                this.element.append(this.stateView.element)
                this.stateView.onAttach()
            }
        }
        return this.stateView as T
    }

    protected assertStateView<T extends GameStateView>(clazz: Constructor<T> | null): T | null {
        if(clazz === null) {
            if(this.stateView !== null) {
                throw new Error("Assertion failed: stateView expected to be null")
            }
            return null
        }

        if(!(this.stateView instanceof clazz)) {
            throw new Error("Assertion failed: stateView class mismatch")
        }

        return this.stateView
    }
}