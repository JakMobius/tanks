import {GameOverlayConfig} from "src/client/ui/overlay/game-overlay/game-overlay";
import GameStateOverlay from "src/client/ui/overlay/game-overlay/game-state-overlay";
import {DMGameState, DMGameStateType} from "src/entity/types/controller-dm/dm-game-state";
import DMWaitingStateView from "src/client/ui/overlay/game-overlay/dm-game-overlay/dm-waiting-state-view";
import DMMatchOverStateView from "src/client/ui/overlay/game-overlay/dm-game-overlay/dm-match-over-state-view";
import DMPlayingStateView from "src/client/ui/overlay/game-overlay/dm-game-overlay/dm-playing-state-view";

export default class DMGameStateOverlay extends GameStateOverlay {

    constructor(options: GameOverlayConfig) {
        super(options);
        this.show()
    }

    setData(state: DMGameState | null) {
        if(!state) {
            this.setStateView(null)
            return
        }

        switch (state.state) {
            case DMGameStateType.waitingForPlayers:
                this.setStateView(DMWaitingStateView).setState(state)
                break;
            case DMGameStateType.matchOver:
                this.setStateView(DMMatchOverStateView).setState(state)
                break;
            case DMGameStateType.playing:
                this.setStateView(DMPlayingStateView).setState(state)
                break;
            default:
                this.setStateView(null)
                break;
        }
    }
}