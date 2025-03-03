import './room-cell.scss'

import RoomCellStatusLabel from "./room-cell-status-label/room-cell-status-label";
import React from 'react';

export interface RoomCellProps {
    name: string
    map: string
    mode: string
    players: number
    maxPlayers: number
    callback?: () => void
}

const RoomCell: React.FC<RoomCellProps> = (props) => {
    return (
        <div className="room-cell-container">
            <div className="room-cell-line"></div>
            <div className="room-cell">
                <div className="room-cell-top-line">
                    <div className="room-cell-title">{props.name}</div>
                    <RoomCellStatusLabel players={props.players} max={props.maxPlayers}></RoomCellStatusLabel>
                </div>
                <div className="room-cell-bottom-line">
                    <div className="room-cell-map-icon"></div>
                    <div className="room-cell-map-description">
                        <span className="map-name">{props.map}</span>
                        <span>&nbsp;</span>
                        <span className="map-mode">{props.mode}</span>
                    </div>
                </div>
            </div>
            <div className="spacer"></div>
            <button className="room-cell-button" onClick={props.callback}>В бой!</button>
        </div>
    );
}

export default RoomCell;