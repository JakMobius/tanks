import {GameOverlayConfig} from "src/client/ui/overlay/game-overlay/game-overlay";
import {
    CTFEventData,
    CTFFlagEventType,
    CTFGameData,
    CTFGameStateType
} from "src/entity/types/controller-ctf/ctf-game-data";
import CTFWaitingStateView from "src/client/ui/overlay/game-overlay/ctf-game-overlay/ctf-waiting-state-view";
import CTFMatchOverStateView from "src/client/ui/overlay/game-overlay/ctf-game-overlay/ctf-match-over-state-view";
import CTFPlayingStateView from "src/client/ui/overlay/game-overlay/ctf-game-overlay/ctf-playing-state-view";
import GameStateOverlay from "src/client/ui/overlay/game-overlay/game-state-overlay";

export default class CTFGameStateOverlay extends GameStateOverlay {

    constructor(options: GameOverlayConfig) {
        super(options);
        this.show()
    }

    setData(state: CTFGameData | null) {
        if(!state) {
            this.setStateView(null)
            return
        }

        switch (state.state) {
            case CTFGameStateType.waitingForPlayers:
                this.setStateView(CTFWaitingStateView).setData(state)
                break;
            case CTFGameStateType.matchOver:
                this.setStateView(CTFMatchOverStateView).setData(state)
                break;
            case CTFGameStateType.playing:
                this.setStateView(CTFPlayingStateView).setData(state)
                break;
            default:
                this.setStateView(null)
                break;
        }
    }

    handleEvent(event: CTFEventData) {
        this.assertStateView(CTFPlayingStateView).handleFlagEvent(event)
    }
}