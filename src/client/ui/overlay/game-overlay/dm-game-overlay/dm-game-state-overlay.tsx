import GameOverlay, {GameOverlayConfig} from "src/client/ui/overlay/game-overlay/game-overlay";
import {DMGameState, DMGameStateType} from "src/entity/types/controller-dm/dm-game-state";
import DMWaitingStateView from "src/client/ui/overlay/game-overlay/dm-game-overlay/dm-waiting-state-view";
import DMMatchOverStateView from "src/client/ui/overlay/game-overlay/dm-game-overlay/dm-match-over-state-view";
import DMPlayingStateView from "src/client/ui/overlay/game-overlay/dm-game-overlay/dm-playing-state-view";
import React from "react";
import Entity from "src/utils/ecs/entity";

interface DMGameStateViewProps {
    state: DMGameState
    world: Entity
}

const DMGameStateView: React.FC<DMGameStateViewProps> = (props) => {
    switch (props?.state.state) {
        case DMGameStateType.waitingForPlayers:
            return <DMWaitingStateView state={props.state} world={props.world} />
        case DMGameStateType.matchOver:
            return <DMMatchOverStateView state={props.state} world={props.world}/>
        case DMGameStateType.playing:
            return <DMPlayingStateView state={props.state} world={props.world} />
        default:
            return <></>
    }
}

export default class DMGameStateOverlay extends GameOverlay {
    setData(state: DMGameState | null) {
        this.reactRoot.render(<DMGameStateView state={state} world={this.world} />)
    }
}