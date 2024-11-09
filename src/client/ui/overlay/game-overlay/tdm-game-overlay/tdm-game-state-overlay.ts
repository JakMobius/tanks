import {GameOverlayConfig} from "src/client/ui/overlay/game-overlay/game-overlay";
import {TDMGameState, TDMGameStateType} from "src/entity/types/controller-tdm/tdm-game-state";
import TDMWaitingStateView from "src/client/ui/overlay/game-overlay/tdm-game-overlay/tdm-waiting-state-view";
import TDMMatchOverStateView from "src/client/ui/overlay/game-overlay/tdm-game-overlay/tdm-match-over-state-view";
import TDMPlayingStateView from "src/client/ui/overlay/game-overlay/tdm-game-overlay/tdm-playing-state-view";
import GameStateOverlay from "src/client/ui/overlay/game-overlay/game-state-overlay";

export default class TDMGameStateOverlay extends GameStateOverlay {

    constructor(options: GameOverlayConfig) {
        super(options);
        this.show()
    }

    setData(state: TDMGameState | null) {
        if(!state) {
            this.setStateView(null)
            return
        }

        switch (state.state) {
            case TDMGameStateType.waitingForPlayers:
                this.setStateView(TDMWaitingStateView).setState(state)
                break;
            case TDMGameStateType.matchOver:
                this.setStateView(TDMMatchOverStateView).setState(state)
                break;
            case TDMGameStateType.playing:
                this.setStateView(TDMPlayingStateView).setState(state)
                break;
            default:
                this.setStateView(null)
                break;
        }
    }
}