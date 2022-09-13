/* @load-resource: './tdm-game-overlay.scss' */

import GameOverlay, {GameOverlayConfig} from "../game-overlay";
import {TDMGameState, TDMGameStateType} from "src/game-modes/tdm-game-state";
import TDMWaitingStateView from "./tdm-waiting-state-view";
import TDMMatchOverStateView from "./tdm-match-over-state-view";
import TDMPlayingStateView from "./tdm-playing-state-view";

export default class TDMGameOverlay extends GameOverlay {

    constructor(options: GameOverlayConfig) {
        super(options);
        this.overlay.addClass("tdm-game-overlay")
        this.show()
    }

    setData(state: TDMGameState | null) {
        if(!state) {
            this.setView(null)
            return
        }

        switch (state.state) {
            case TDMGameStateType.waiting_for_players:
                this.setView(TDMWaitingStateView).setState(state)
                break;
            case TDMGameStateType.match_over:
                this.setView(TDMMatchOverStateView).setState(state)
                break;
            case TDMGameStateType.playing:
                this.setView(TDMPlayingStateView).setState(state)
                break;
            default:
                this.setView(null)
                break;
        }
    }
}