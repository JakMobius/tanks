import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";
import TimerComponent from "src/entity/components/network/timer/timer-component";
import GameStateView from "src/client/ui/game-hud/game-state-view";
import React, { useEffect, useState } from "react";
import Entity from "src/utils/ecs/entity";
import { CTFGameStateWaitingForPlayers } from "src/entity/types/controller-ctf/ctf-game-state";

interface TDMWaitingStateViewProps {
    world: Entity
    state: CTFGameStateWaitingForPlayers
}

const TDMWaitingStateView: React.FC<TDMWaitingStateViewProps> = (props) => {

    const [state, setState] = useState({
        mapName: null as string | null,
        refresh: {}
    })

    const updateMapName = () => {
        setState(state => ({
            ...state,
            mapName: props.world.getComponent(WorldStatisticsComponent).mapName
        }))
    }

    const onTimerTransmit = () => {
        setState(state => ({
            ...state,
            refresh: {}
        }))
    }

    useEffect(() => {
        if(!props.world) return undefined
        props.world.on("map-name-updated", updateMapName)
        updateMapName()
        return () => props.world.off("map-name-updated", updateMapName)
    }, [props.world])

    useEffect(() => {
        if(!props.state.timer) return undefined
        props.state.timer.on("timer-transmit", onTimerTransmit)
        onTimerTransmit()
        return () => props.state.timer.off("timer-transmit", onTimerTransmit)
    }, [props.state.timer])

    let currentPlayerCount = props.state.currentPlayers
    let requiredPlayerCount = props.state.minPlayers

    return (
        <GameStateView visibility="show" header={
            currentPlayerCount < requiredPlayerCount
                ? <span>Ожидание игроков <span className="player-count">{currentPlayerCount}/{requiredPlayerCount}</span></span>
                : <span>Игра начнется через {props.state.timer.getComponent(TimerComponent).getMSTimeString()}</span>
        }>
            {state.mapName}
        </GameStateView>
    )
}

export default TDMWaitingStateView