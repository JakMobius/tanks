import './room-cell-status-label.scss'

import React from 'react';

interface RoomCellStatusLabelProps {
    players?: number
    max?: number
}

export const RoomCellStatusLabel: React.FC<RoomCellStatusLabelProps> = ({ players, max }) => {
    return (
        <div className="room-cell-status">
            <div className="room-cell-status-icon turned" style={{ backgroundImage: 'url("static/hub/classic-tank.png")' }}></div>
            <div className="room-cell-status-text">{players}/{max}</div>
        </div>
    );
}

export default RoomCellStatusLabel
