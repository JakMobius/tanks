import Entity from "../utils/ecs/entity";
import {TDMTeamStatistics} from "../server/room/game-modes/tdm/tdm-playing-state-controller";

export enum TDMGameStateType {
    waiting_for_players,
    playing,
    match_over
}

export type TDMGameStateMatchOver = {
    state: TDMGameStateType.match_over
    teamStatistics: TDMTeamStatistics[]
}

export type TDMGameStatePlaying = {
    state: TDMGameStateType.playing
    quickMatchEnd: boolean
}

export type TDMGameStateWaitingForPlayers = {
    state: TDMGameStateType.waiting_for_players
    minPlayers: number
    timer: Entity
}

export type TDMGameState = TDMGameStateMatchOver | TDMGameStatePlaying | TDMGameStateWaitingForPlayers