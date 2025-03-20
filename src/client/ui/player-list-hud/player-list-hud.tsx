import './player-list-hud.scss'

import Entity from "src/utils/ecs/entity";
import WorldStatisticsComponent, {
    PlayerStatistics
} from "src/entity/components/world-statistics/world-statistics-component";
import TeamColor from "src/utils/team-color"
import Cloud from 'src/client/ui/cloud/cloud';
import React, { useCallback, useEffect, useState } from 'react';
import { useControls } from 'src/client/utils/react-controls-responder';
import TimerComponent from 'src/entity/types/timer/timer-component';

export interface PlayerListTableProps {
    players: PlayerStatistics[]
}

const PlayerListTable: React.FC<PlayerListTableProps> = React.memo((props) => {
    return (
        <table className="player-list-table">
            <thead>
                <tr className="player-list-table-header">
                    <th>Имя</th>
                    <th>Счёт</th>
                    <th>Смертей</th>
                    <th>Убийств</th>
                    <th>У/С</th>
                </tr>
                <tr className="player-list-table-separator"></tr>
            </thead>
            <tbody>
                {props.players.map((player) => (
                    <tr className="player-list-table-row" key={player.name}>
                        <th className="player-list-nickname" style={{ color: TeamColor.getColor(player.teamId).code() }}>
                            {player.name}
                        </th>
                        <th>{player.score}</th>
                        <th>{player.deaths}</th>
                        <th>{player.kills}</th>
                        <th>{player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : "-"}</th>
                    </tr>
                ))}
            </tbody>
        </table>
    )
})

interface PlayerListHUDProps {
    world?: Entity
}

const PlayerListHUD: React.FC<PlayerListHUDProps> = React.memo((props) => {

    const [state, setState] = useState({
        mapName: null as string | null,
        roomTime: null as string | null,
        players: [] as PlayerStatistics[],
        shown: false,
        world: null as Entity | null,
        timer: null as Entity | null
    })

    const gameControls = useControls()

    const updateTimerText = useCallback(() => {
        let timerComponent = state.timer?.getComponent(TimerComponent)
        let timeString = timerComponent?.formatTimeMinSec()
        setState((state) => ({ ...state, roomTime: timeString ?? null }))
    }, [state.timer])

    const updateTable = useCallback(() => {
        let statisticsComponent = state.world?.getComponent(WorldStatisticsComponent)
        setState((state) => ({ ...state, players: [...statisticsComponent?.playerStatistics ?? []] }))
    }, [state.world])

    const updateMapName = useCallback(() => {
        let statisticsComponent = state.world?.getComponent(WorldStatisticsComponent)
        setState((state) => ({ ...state, mapName: statisticsComponent?.mapName ?? null }))
    }, [state.world])

    const getWorldTimer = useCallback(() => {
        setState(state => ({
            ...state,
            timer: state.world?.getComponent(WorldStatisticsComponent).matchTimeLeftTimer
        }))
    }, [state.world])

    const onShow = useCallback(() => setState((state) => ({ ...state, shown: true })), [])
    const onHide = useCallback(() => setState((state) => ({ ...state, shown: false })), [])

    useEffect(() => {
        setState((state) => ({ ...state, world: props.world }))
    }, [props.world])

    useEffect(() => {
        let world = state.world

        getWorldTimer()
        updateTable()
        updateMapName()

        if(!world) return undefined

        world.on("player-statistics-updated", updateTable)
        world.on("map-name-updated", updateMapName)
        world.on("match-timer-set", getWorldTimer)

        return () => {
            world.off("player-statistics-updated", updateTable)
            world.off("map-name-updated", updateMapName)
            world.off("match-timer-set", getWorldTimer)
        }
    }, [state.world])

    useEffect(() => {
        updateTimerText()
        let timer = state.timer
        timer?.on("timer-transmit", updateTimerText)
        return () => timer?.off("timer-transmit", updateTimerText)
    }, [state.timer])

    useEffect(() => {
        if(!gameControls) return undefined
        gameControls.on("game-player-list-show", () => onShow())
        gameControls.on("game-player-list-hide", () => onHide())

        return () => {
            gameControls.off("game-player-list-show", () => onShow())
            gameControls.off("game-player-list-hide", () => onHide())
        }
    }, [gameControls])

    return (
        <div className="player-list-overlay" style={{display: state.shown ? undefined : "none"}}>
            <div className="player-list-menu">
                <div className="player-list-header">
                    <Cloud className={"map-name-cloud " + state.mapName}>{state.mapName}</Cloud>
                    <Cloud className={"room-time-cloud "}>{state.roomTime}</Cloud>
                </div>
                <div className="player-list-cloud">
                    <PlayerListTable players={state.players} />
                </div>
            </div>
        </div>
    )
})

export default PlayerListHUD