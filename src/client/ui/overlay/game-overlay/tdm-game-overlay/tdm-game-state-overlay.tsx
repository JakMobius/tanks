import GameOverlay, {GameOverlayConfig} from "src/client/ui/overlay/game-overlay/game-overlay";
import {TDMGameState, TDMGameStateType} from "src/entity/types/controller-tdm/tdm-game-state";
import TDMWaitingStateView from "src/client/ui/overlay/game-overlay/tdm-game-overlay/tdm-waiting-state-view";
import TDMMatchOverStateView from "src/client/ui/overlay/game-overlay/tdm-game-overlay/tdm-match-over-state-view";
import TDMPlayingStateView from "src/client/ui/overlay/game-overlay/tdm-game-overlay/tdm-playing-state-view";
import Entity from "src/utils/ecs/entity";
import React from "react";

interface TDMGameStateViewProps {
    state: TDMGameState
    world: Entity
}

const TDMGameStateView: React.FC<TDMGameStateViewProps> = (props) => {
    switch (props?.state.state) {
        case TDMGameStateType.waitingForPlayers:
            return <TDMWaitingStateView state={props.state} world={props.world} />
        case TDMGameStateType.matchOver:
            return <TDMMatchOverStateView state={props.state}/>
        case TDMGameStateType.playing:
            return <TDMPlayingStateView state={props.state} world={props.world} />
        default:
            return <></>
    }
}

export default class TDMGameStateOverlay extends GameOverlay {
    setData(state: TDMGameState | null) {
        this.reactRoot.render(<TDMGameStateView state={state} world={this.world} />)
    }
}