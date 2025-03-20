
import {
    RaceGameEvent,
    RaceGameMatchOverState,
    RaceGamePlayingState,
    RaceGameState,
    RaceGameStateType,
    RaceGameStateWaitingForPlayers
} from "src/entity/types/controller-race/race-game-state";
import React, { useEffect, useState } from "react";
import Entity from "src/utils/ecs/entity";
import WorldStatisticsComponent from "src/entity/components/world-statistics/world-statistics-component";
import GameStateView from "../../../../client/ui/game-hud/game-state-view";
import TimerComponent from "../../timer/timer-component";
import { formatTimeMinSecMil } from "src/utils/utils";

interface WaitingStateViewProps extends RaceGameStateHUDProps{
    state: RaceGameStateWaitingForPlayers
}

const WaitingStateView: React.FC<WaitingStateViewProps> = (props) => {

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

    if(props.state.playersGassing === props.state.playersTotal) {
        let timer = props.state.timer.getComponent(TimerComponent)
        return (
            <GameStateView visibility="show" header={timer.formatTimeMinSec()}>
                Приготовьтесь!
            </GameStateView>
        )
    }

    if(props.state.isGassing) {
        return (
            <GameStateView visibility="show" header="Удерживайте газ">
                Ждем остальных игроков ({props.state.playersGassing} / {props.state.playersTotal})
            </GameStateView>
        )
    }

    return (
        <GameStateView visibility="show" header="Нажмите газ!">
            {state.mapName}
        </GameStateView>
    )
}

interface PlayingStateViewProps extends RaceGameStateHUDProps{
    state: RaceGamePlayingState
}

const PlayingStateView: React.FC<PlayingStateViewProps> = (props) => {

    const [state, setState] = useState({
        visibility: null as {} | null
    })

    const getTimer = () => {
        return props.world?.getComponent(WorldStatisticsComponent)?.getMatchLeftTimerComponent()
    }

    useEffect(() => {
        setState(state => ({ ...state, visibility: {} }))
    }, [props.event])


    if(props.event) {
        return (
            <GameStateView visibility={state.visibility} header={formatTimeMinSecMil(props.event.time)}>
                Чекпоинт {props.event.checkpoint + 1} / {props.event.totalCheckpoints}
            </GameStateView>
        )
    }
    return <></>
}

interface RaceOverStateViewProps extends RaceGameStateHUDProps {
    state: RaceGameMatchOverState
}

const RaceOverStateView: React.FC<RaceOverStateViewProps> = (props) => {    
    return (
        <GameStateView visibility="show" header="Гонка окончена">

        </GameStateView>
    )
}

interface RaceGameStateHUDProps {
    state: RaceGameState
    world: Entity
    event: RaceGameEvent
}

export const RaceGameStateHUD: React.FC<RaceGameStateHUDProps> = (props) => {    
    switch (props?.state.state) {
        case RaceGameStateType.waitingForStart:
            return <WaitingStateView {...props as WaitingStateViewProps} />;
        case RaceGameStateType.raceOver:
            return <RaceOverStateView {...props as RaceOverStateViewProps} />;
        case RaceGameStateType.playing:
            return <PlayingStateView {...props as PlayingStateViewProps} />
        default:
            return <></>
    }
}
